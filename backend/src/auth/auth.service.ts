import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tenantsService: TenantsService,
    private jwtService: JwtService,
  ) {}

  async register(tenantData: { name: string; subdomain?: string }, userData: { email: string; password: string }) {
    const tenant = await this.tenantsService.create(tenantData);
    const password_hash = await bcrypt.hash(userData.password, 10);
    const user = await this.usersService.create({
      tenant_id: tenant.id,
      email: userData.email,
      password_hash,
      role: 'admin',
    });
    const payload = { sub: user.id, email: user.email, tenantId: tenant.id, role: user.role };
    const access_token = this.jwtService.sign(payload);
    return { access_token, tenant, user };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');
    const tenant = await this.tenantsService.findOne(user.tenant_id);
    const payload = { sub: user.id, email: user.email, tenantId: user.tenant_id, role: user.role };
    const access_token = this.jwtService.sign(payload);
    return { access_token, tenant, user };
  }
}