import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: { tenantName: string; subdomain?: string; email: string; password: string }) {
    return this.authService.register(
      { name: body.tenantName, subdomain: body.subdomain },
      { email: body.email, password: body.password },
    );
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}