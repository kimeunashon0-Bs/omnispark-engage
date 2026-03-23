import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from './campaign.entity';
import { CampaignRecipient } from './campaign-recipient.entity';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, CampaignRecipient]),
    QueueModule,
  ],
  providers: [CampaignsService],
  controllers: [CampaignsController],
})
export class CampaignsModule {}