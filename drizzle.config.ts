import type { Config } from 'drizzle-kit';
import { join } from 'path';

export default {
  schema: './app/utils/schema.ts',
  out: './drizzle/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || join(process.cwd(), 'data', 'db.sqlite'),
  },
} satisfies Config;
