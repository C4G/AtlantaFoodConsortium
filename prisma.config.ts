import 'dotenv/config';
import { defineConfig } from 'prisma/config';

let db_url = undefined;
if (process.env.DATABASE_URL) {
  db_url = process.env.DATABASE_URL;
} else {
  console.warn(
    'DATABASE_URL is not set. Please set it in your environment variables.'
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.mjs',
  },
  datasource: {
    url: db_url,
  },
});
