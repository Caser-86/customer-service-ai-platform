import { z } from 'zod';

export const configSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  PORT: z.string().default('3001'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  LLM_PROVIDER: z.enum(['mock', 'openai-compatible']).default('mock'),
  LLM_API_KEY: z.string().optional(),
  LLM_API_BASE: z.string().default('https://api.openai.com/v1'),
  LLM_MODEL: z.string().default('gpt-4'),
  VISITOR_TOKEN_SECRET: z
    .string()
    .min(16, 'VISITOR_TOKEN_SECRET must be at least 16 characters')
    .default('visitor-secret-change-me-in-production')
});

export type Config = z.infer<typeof configSchema>;
