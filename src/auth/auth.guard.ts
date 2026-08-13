import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from 'generated/prisma/client';
import { Observable } from 'rxjs';
import { AccessTokenPayload } from './auth.interface';

@Injectable()
export class CheckAuth implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token missing');
    }
    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid or Expired token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = User>(err: unknown, user: User, info: unknown): TUser {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException('Access token expired');
    }
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException('Invalid token');
    }
    if (err || !user) {
      throw new UnauthorizedException('Authentication Required');
    }

    return user as TUser;
  }
}
