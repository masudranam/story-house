import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma 7: the CLI (migrate/seed/studio) reads the connection URL from here,
// not from schema.prisma. The runtime client gets it via the pg adapter in
// src/prisma/prisma.service.ts.
function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set — copy backend/.env.example to backend/.env first`,
    );
  }
  return value;
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: requiredEnv('DATABASE_URL'),
  },
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
});
