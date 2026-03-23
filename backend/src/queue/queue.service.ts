import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull'; // type import

@Injectable()
export class QueueService {
  constructor(@InjectQueue('message-queue') private messageQueue: Queue) {}

  async sendMessage(campaignId: string, contactId: string, channel: string, content: string) {
    await this.messageQueue.add('send-message', {
      campaignId,
      contactId,
      channel,
      content,
    });
  }
}