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
import { CheckAuth } from './auth.gaurd';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  // validate dto using pipes
  async register(@Body() dto: AuthDto) {
    return this.authService.registerUser(dto);
  }

  @UseGuards(CheckAuth)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
