import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async checkLive() {
    return {
      status: 'live',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  async checkReady() {
    const checks: Record<string, string> = {};

    // 数据库检查
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'healthy';
    } catch (error) {
      checks.database = 'unhealthy';
      checks.database_error = error.message;
    }

    // Redis 检查
    try {
      // TODO: 实现 Redis 连接检查
      checks.redis = 'healthy';
    } catch (error) {
      checks.redis = 'unhealthy';
      checks.redis_error = error.message;
    }

    // MinIO 检查
    try {
      // TODO: 实现 MinIO 连接检查
      checks.minio = 'healthy';
    } catch (error) {
      checks.minio = 'unhealthy';
      checks.minio_error = error.message;
    }

    const allHealthy = Object.values(checks).every((v) => v === 'healthy');

    return {
      status: allHealthy ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get('NODE_ENV', 'development')
    };
  }

  async getDetailedHealth() {
    const basicHealth = await this.checkReady();

    return {
      ...basicHealth,
      metrics: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        pid: process.pid,
        version: process.version,
        platform: process.platform
      },
      config: {
        nodeEnv: this.configService.get('NODE_ENV', 'development'),
        port: this.configService.get('PORT', 3001),
        corsOrigin: this.configService.get(
          'CORS_ORIGIN',
          'http://localhost:3000'
        )
      }
    };
  }
}
