import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull'; // type import

@Processor('message-queue')
export class MessageProcessor {
  @Process('send-message')
  async handleSend(job: Job) {
    const { campaignId, contactId, channel, content } = job.data;
    console.log(`Processing job: ${job.id}`);
    console.log(`Campaign: ${campaignId}, Contact: ${contactId}, Channel: ${channel}`);
    console.log(`Content: ${content}`);
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Message sent to ${contactId}`);
    return { success: true };
  }
}