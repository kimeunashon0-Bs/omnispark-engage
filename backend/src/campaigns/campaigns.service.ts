import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './campaign.entity';
import { CampaignRecipient } from './campaign-recipient.entity';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
    @InjectRepository(CampaignRecipient)
    private recipientsRepository: Repository<CampaignRecipient>,
    private queueService: QueueService,
  ) {}

  async findAll(tenantId: string): Promise<Campaign[]> {
    return this.campaignsRepository.find({
      where: { tenant_id: tenantId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Campaign> {
    const campaign = await this.campaignsRepository.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!campaign) throw new NotFoundException(`Campaign ${id} not found`);
    return campaign;
  }

  async create(campaignData: Partial<Campaign>): Promise<Campaign> {
    const campaign = this.campaignsRepository.create(campaignData);
    return this.campaignsRepository.save(campaign);
  }

  async update(
    id: string,
    tenantId: string,
    updateData: Partial<Campaign>,
  ): Promise<Campaign> {
    await this.findOne(id, tenantId);
    await this.campaignsRepository.update({ id, tenant_id: tenantId }, updateData);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.campaignsRepository.delete({ id, tenant_id: tenantId });
  }

  async addRecipients(
    campaignId: string,
    tenantId: string,
    contactIds: string[],
  ): Promise<void> {
    const campaign = await this.findOne(campaignId, tenantId);
    if (!campaign) throw new NotFoundException('Campaign not found');

    const recipients = contactIds.map((contactId) => ({
      campaign_id: campaignId,
      contact_id: contactId,
      status: 'pending' as const, // ensures correct literal type
    }));
    await this.recipientsRepository.insert(recipients);
  }

  async getRecipients(
    campaignId: string,
    tenantId: string,
  ): Promise<CampaignRecipient[]> {
    await this.findOne(campaignId, tenantId);
    return this.recipientsRepository.find({
      where: { campaign_id: campaignId },
      relations: ['contact'],
    });
  }

  async sendCampaign(campaignId: string, tenantId: string): Promise<void> {
    const campaign = await this.findOne(campaignId, tenantId);
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new BadRequestException('Campaign cannot be sent');
    }

    const recipients = await this.recipientsRepository.find({
      where: { campaign_id: campaignId, status: 'pending' },
    });

    if (recipients.length === 0) {
      throw new BadRequestException('No recipients added to this campaign');
    }

    // Update campaign status to 'sending'
    await this.campaignsRepository.update(campaignId, { status: 'sending' });

    // Queue each recipient
    for (const recipient of recipients) {
      await this.queueService.sendMessage(
        campaignId,
        recipient.contact_id,
        campaign.type,
        campaign.content,
      );
      await this.recipientsRepository.update(recipient.id, { status: 'queued' });
    }

    // Mark campaign as sent (you might want to track actual completion in real life)
    await this.campaignsRepository.update(campaignId, {
      status: 'sent',
      sent_at: new Date(),
    });
  }
}