import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    ANTHROPIC_API_KEY: z
      .string()
      .regex(/^sk-ant-/, 'ANTHROPIC_API_KEY must start with sk-ant-')
      .optional(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  client: {},
  runtimeEnv: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
  },
});
