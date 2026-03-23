import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Campaign } from './campaign.entity';
import { Contact } from '../contacts/contact.entity';

@Entity('campaign_recipients')
export class CampaignRecipient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  campaign_id: string;

  @ManyToOne(() => Campaign, (campaign) => campaign.recipients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @Column({ type: 'uuid' })
  contact_id: string;

  @ManyToOne(() => Contact, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: 'pending' | 'queued' | 'sent' | 'failed';

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  provider_response: any;
}