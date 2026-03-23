import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { Campaign } from './campaign.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: { userId: string; email: string; tenantId: string; role: string };
}

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Get()
  findAll(@Req() req: RequestWithUser): Promise<Campaign[]> {
    return this.campaignsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser): Promise<Campaign> {
    return this.campaignsService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Body() body: Partial<Campaign>, @Req() req: RequestWithUser): Promise<Campaign> {
    const campaignData = { ...body, tenant_id: req.user.tenantId, created_by: req.user.userId };
    return this.campaignsService.create(campaignData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<Campaign>, @Req() req: RequestWithUser): Promise<Campaign> {
    return this.campaignsService.update(id, req.user.tenantId, updateData);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: RequestWithUser): Promise<void> {
    return this.campaignsService.delete(id, req.user.tenantId);
  }

  @Post(':id/recipients')
  async addRecipients(
    @Param('id') id: string,
    @Body() body: { contactIds: string[] },
    @Req() req: RequestWithUser,
  ) {
    await this.campaignsService.addRecipients(id, req.user.tenantId, body.contactIds);
    return { success: true };
  }

  @Get(':id/recipients')
  async getRecipients(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.campaignsService.getRecipients(id, req.user.tenantId);
  }

  @Post(':id/send')
  async sendCampaign(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    await this.campaignsService.sendCampaign(id, req.user.tenantId);
    return { success: true };
  }
}