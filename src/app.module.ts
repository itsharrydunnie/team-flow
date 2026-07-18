import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from './configuration/app.config';
import { validate } from './env.validation';
import dbConfig from './configuration/db.config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { MiddlewareModule } from './middleware/middleware.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      validate,
      isGlobal: true,
      load: [appConfig, dbConfig],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
  ],
  providers: [AppService],
})
export class AppModule {}
