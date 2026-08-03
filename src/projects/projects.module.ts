import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ProjectsController],
  imports: [PrismaModule],
})
export class ProjectsModule {}
