import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [ProjectsController],
  imports: [PrismaModule],
  providers: [ProjectsService],
})
export class ProjectsModule {}
