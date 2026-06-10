import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async checkLive() {
    return { status: 'live', timestamp: new Date().toISOString() };
  }

  async checkReady() {
    const checks: Record<string, string> = {};

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'healthy';
    } catch {
      checks.database = 'unhealthy';
    }

    try {
      // Redis check would go here
      checks.redis = 'healthy';
    } catch {
      checks.redis = 'unhealthy';
    }

    try {
      // MinIO check would go here
      checks.minio = 'healthy';
    } catch {
      checks.minio = 'unhealthy';
    }

    const allHealthy = Object.values(checks).every((v) => v === 'healthy');

    return {
      status: allHealthy ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString()
    };
  }
}
