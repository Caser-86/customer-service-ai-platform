import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PublicModule } from './public/public.module';
import { AgentModule } from './agent/agent.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PublicModule,
    AgentModule,
    AdminModule,
    HealthModule,
    AiModule
  ]
})
export class AppModule {}
