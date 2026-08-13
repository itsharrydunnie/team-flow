import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class CheckAuth implements NestMiddleware {
  constructor(private authService: AuthService) {}
  use(req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }
  }
}
