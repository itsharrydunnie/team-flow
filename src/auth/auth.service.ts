import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './auth.dto';
import bcrypt from 'bcryptjs';
import {
  JsonWebTokenError,
  JwtService,
  NotBeforeError,
  TokenExpiredError,
} from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { Prisma, User } from 'generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UsersService,
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
      const payload = await this.jwtService.verifyAsync(token);
      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Refresh token expired');
      }

      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (error instanceof NotBeforeError) {
        throw new UnauthorizedException('Refresh token not active');
      }

      throw new UnauthorizedException();
    }
  }

  async registerUser(
    dto: AuthDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const hashedPassword = await this.hashPasword(dto.password);

    //check for duplicate email
    // const checkUser = await this.userService.findUserByEmail(dto.email);

    // if (checkUser) {
    //   throw new BadRequestException('Duplicate email');
    // }

    try {
      const user = await this.prisma.user.create({
        data: { email: dto.email, passwordHash: hashedPassword },
      });

      const accessToken = await this.signAccessToken({
        userId: user.id,
        email: user.email,
      });

      const refreshToken = await this.signRefreshToken({ userId: user.id });

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Email already exist');
        }
      }
      throw error;
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email);
    if (user) {
      const comparedHash = await bcrypt.compare(pass, user.passwordHash);
      if (!comparedHash) {
        throw new BadRequestException('Incorrect password or email');
      }
      // remove sensitive data like password
      return user;
    }
    throw new BadRequestException('User not found');
  }

  async loginUser(user: User) {
    const { id, email } = user;
    const accessToken = await this.signAccessToken({ userId: id, email });
    const refreshToken = await this.signRefreshToken({ userId: id });
    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const { sub, type } = await this.validateToken(refreshToken);

    if (type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userService.findUserById(sub);
    // compare against stored/hashed refresh token

    // ↓
    // if mismatch -> Unauthorized

    // ↓
    // generate new access token

    // ↓
    // (optional) rotate refresh token

    // new access token

    if (!user) {
      throw new UnauthorizedException("could'nt find user"); // should change for better error msg
    }
    const accessToken = await this.signAccessToken({
      userId: user.id,
      email: user.email,
    });

    return { accessToken };
  }
}
