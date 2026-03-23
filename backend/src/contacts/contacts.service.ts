import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
  ) {}

  async findAll(tenantId: string): Promise<Contact[]> {
    return this.contactsRepository.find({ where: { tenant_id: tenantId } });
  }

  async findOne(id: string, tenantId: string): Promise<Contact> {
    const contact = await this.contactsRepository.findOne({ where: { id, tenant_id: tenantId } });
    if (!contact) throw new NotFoundException(`Contact ${id} not found`);
    return contact;
  }

  async create(contactData: Partial<Contact>): Promise<Contact> {
    const contact = this.contactsRepository.create(contactData);
    return this.contactsRepository.save(contact);
  }

  async update(id: string, tenantId: string, updateData: Partial<Contact>): Promise<Contact> {
    await this.findOne(id, tenantId); // ensure exists
    await this.contactsRepository.update({ id, tenant_id: tenantId }, updateData);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.contactsRepository.delete({ id, tenant_id: tenantId });
  }
}