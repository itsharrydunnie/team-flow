import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './auth.dto';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private async hashPasword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  private async signAccessToken(dto: {
    userId: string;
    email: string;
  }): Promise<string> {
    const payload = { sub: dto.userId, email: dto.email, type: 'access' };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    return token;
  }

  private async signRefreshToken(dto: { userId: string }): Promise<string> {
    const payload = { sub: dto.userId, type: 'refresh' };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return token;
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async registerUser(
    dto: AuthDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const hashedPassword = await this.hashPasword(dto.password);

    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash: hashedPassword },
    });
    const accessToken = await this.signAccessToken({
      userId: user.id,
      email: user.email,
    });
    const refreshToken = await this.signRefreshToken({ userId: user.id });
    console.log('new user:', user);
    return { accessToken, refreshToken };
  }
}
