import { HealthStats } from './health.interfaces';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}
  async checkHealth(): Promise<HealthStats> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'up' };
    } catch {
      return {
        status: 'ok',
        database: 'down',
      };
    }
  }
}
