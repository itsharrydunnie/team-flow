import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, LoginDto } from './auth.dto';
import { JwtAuthGuard, LocalAuthGuard } from './auth.gaurd';
import { ValidateDTO } from 'src/common/pipe/validation.pipe';
import { CurrentUser } from './auth.decorator';
import type { User } from 'generated/prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  // validate dto using pipes
  async register(@Body(new ValidateDTO()) dto: AuthDto) {
    return this.authService.registerUser(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body(new ValidateDTO()) login: LoginDto,
    @CurrentUser() user: User,
  ) {
    return this.authService.loginUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: User) {
    return user;
  }

  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }
}
