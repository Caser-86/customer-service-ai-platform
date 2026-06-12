import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness check' })
  async live() {
    return this.healthService.checkLive();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  async ready() {
    return this.healthService.checkReady();
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check with metrics' })
  async detailed() {
    return this.healthService.getDetailedHealth();
  }
}
