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
import { ValidateRegisterDTO } from 'src/pipe/validation.pipe';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  // validate dto using pipes
  async register(@Body(new ValidateRegisterDTO()) dto: AuthDto) {
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
  getCurrentUser(@Request() req) {
    // all user data
    return req.user;
  }

  @Post('refresh')
  // validate refresh token before invoking method
  getFreshAccessToken(@Body() refreshToken) {}
}
