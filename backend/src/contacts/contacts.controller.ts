import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { Contact } from './contact.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: { userId: string; email: string; tenantId: string; role: string };
}

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Get()
  findAll(@Req() req: RequestWithUser): Promise<Contact[]> {
    return this.contactsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser): Promise<Contact> {
    return this.contactsService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Body() body: Partial<Contact>, @Req() req: RequestWithUser): Promise<Contact> {
    // Ensure tenant_id is set from JWT, not from client
    const contactData = { ...body, tenant_id: req.user.tenantId };
    return this.contactsService.create(contactData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<Contact>, @Req() req: RequestWithUser): Promise<Contact> {
    return this.contactsService.update(id, req.user.tenantId, updateData);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: RequestWithUser): Promise<void> {
    return this.contactsService.delete(id, req.user.tenantId);
  }
}