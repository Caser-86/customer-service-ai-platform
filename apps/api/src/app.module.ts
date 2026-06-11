import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PublicModule } from './public/public.module';
import { AgentModule } from './agent/agent.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import { AiModule } from './ai/ai.module';
import { EventsModule } from './events/events.module';
import { configSchema } from './config/config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const result = configSchema.safeParse(config);
        if (!result.success) {
          const errors = result.error.errors
            .map((e) => `${e.path}: ${e.message}`)
            .join(', ');
          throw new Error(`Configuration validation failed: ${errors}`);
        }
        return result.data;
      }
    }),
    PrismaModule,
    EventsModule,
    AuthModule,
    PublicModule,
    AgentModule,
    AdminModule,
    HealthModule,
    AiModule
  ]
})
export class AppModule {}
