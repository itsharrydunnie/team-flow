import { HealthStats } from './health.interfaces';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}
  async checkHealth(): Promise<HealthStats> {
    try {
      const result = await this.prisma.$queryRaw`SELECT 1`;
      console.log(result);
      return { status: 'ok', database: 'up' };
    } catch (error) {
      console.log(error);
      return {
        status: 'ok',
        database: 'down',
      };
    }
  }
}
