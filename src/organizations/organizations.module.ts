import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  imports: [PrismaModule, UsersModule],
})
export class OrganizationsModule {}
