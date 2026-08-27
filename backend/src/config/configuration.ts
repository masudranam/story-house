/**
 * Typed config tree — the only place process.env is read (rule 10-backend-nestjs).
 * Consumers use ConfigService.getOrThrow('section.key').
 */
export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
  },
  db: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  },
  security: {
    bcryptCost: parseInt(process.env.BCRYPT_COST ?? '12', 10),
    throttleTtl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
    throttleLimit: parseInt(process.env.THROTTLE_LIMIT ?? '10', 10),
  },
});
