import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}
  @Get()
  async getHealth() {
    const health = await this.healthService.checkHealth();
    console.log(health);
    return health;
  }
}
