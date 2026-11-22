import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000').transform((v) => parseInt(v, 10)),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432').transform((v) => parseInt(v, 10)),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_NAME: z.string().default('golf_charity'),
  DB_LOGGING: z.string().default('false').transform((v) => v === 'true'),
  JWT_ACCESS_SECRET: z.string().default('dev_jwt_access_secret_key_32_characters_minimum'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().default('dev_jwt_refresh_secret_key_32_characters_minimum'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  STRIPE_SECRET_KEY: z.string().default('sk_test_placeholder'),
  STRIPE_WEBHOOK_SECRET: z.string().default('whsec_placeholder'),
  STRIPE_SUCCESS_URL: z.string().default('http://localhost:5173/dashboard/subscriptions?session_id={CHECKOUT_SESSION_ID}'),
  STRIPE_CANCEL_URL: z.string().default('http://localhost:5173/plans'),
  DEFAULT_CURRENCY: z.string().default('USD'),
  MIN_CHARITY_PERCENTAGE: z.string().default('10.00').transform((v) => parseFloat(v)),
  MAX_ACTIVE_GOLF_SCORES: z.string().default('5').transform((v) => parseInt(v, 10)),
});

export const config = envSchema.parse(process.env);
