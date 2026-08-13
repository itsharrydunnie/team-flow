import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'generated/prisma/client';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }
  async validate(email: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(email, password);
    return user;
  }
}
