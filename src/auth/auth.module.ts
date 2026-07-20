import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthStrategy } from './local.strategy';
import { UsersModule } from 'src/users/users.module';
import { AuthJwtStrategy } from './jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalAuthStrategy, AuthJwtStrategy],
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt_secret'),
      }),
      inject: [ConfigService],
      global: true,
    }),
    PassportModule,
    UsersModule,
  ],
})
export class AuthModule {}
