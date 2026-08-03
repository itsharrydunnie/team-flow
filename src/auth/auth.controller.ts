import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './auth.dto';
import { CheckAuth, JwtAuthGuard, LocalAuthGuard } from './auth.gaurd';
import { ValidateDTO } from 'src/pipe/validation.pipe';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './auth.decorator';
import type { User } from 'src/users/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  // validate dto using pipes
  async register(@Body(new ValidateDTO()) dto: AuthDto) {
    return this.authService.registerUser(dto);
  }

  // @UseGuards(CheckAuth)
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // should only return few data about user
    return req.user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.loginUser(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: User) {
    // all user data
    return user;
  }

  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }
}
