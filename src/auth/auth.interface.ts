import { User } from 'generated/prisma/client';
import { TokenType } from './auth.enum';

export interface AuthenticatedRequest extends Request {
  user: User;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  type: TokenType;
}

export interface RefreshTokenPayload {
  sub: string;
  type: TokenType;
}
