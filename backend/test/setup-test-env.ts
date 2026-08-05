/**
 * Runs (via jest setupFiles) before any test module is imported, so ConfigModule
 * sees these values instead of the developer's .env. Everything is test-local:
 * the throwaway postgres-test container (../docker-compose.yml, host port 5435)
 * and fixed dummy secrets.
 */
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://storyhouse:storyhouse@localhost:5435/storyhouse_test?schema=public';
process.env.JWT_ACCESS_SECRET = 'e2e-access-secret-not-a-real-secret';
process.env.JWT_REFRESH_SECRET = 'e2e-refresh-secret-not-a-real-secret';
process.env.JWT_ACCESS_TTL = '15m';
process.env.JWT_REFRESH_TTL = '7d';
process.env.BCRYPT_COST = '10';
process.env.THROTTLE_TTL = '60000';
// High limit so the throttler never interferes with test speed; the guard's
// wiring is asserted separately via route metadata, not by hammering requests.
process.env.THROTTLE_LIMIT = '1000';
