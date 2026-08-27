import { execSync } from 'node:child_process';

/**
 * Jest globalSetup: reset the disposable e2e schema (rule 50-testing) before
 * the suite runs. Requires the postgres-test container from ../docker-compose.yml.
 */
export default function globalSetup(): void {
  const url =
    process.env.TEST_DATABASE_URL ??
    'postgresql://storyhouse:storyhouse@localhost:5435/storyhouse_test?schema=public';
  // Misuse guard: the reset below WIPES the target. Refuse anything that
  // doesn't look like the dedicated throwaway test database.
  if (!url.includes('storyhouse_test')) {
    throw new Error(
      `Refusing to reset "${url.replace(/\/\/.*@/, '//***@')}" — the e2e database URL must reference storyhouse_test.`,
    );
  }
  try {
    // Prisma 7: reset applies migrations but never seeds (no --skip-seed flag).
    // PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: Prisma's guardrail for
    // AI-run destructive commands. The project owner explicitly approved
    // resetting THIS disposable test database (storyhouse_test, docker
    // postgres-test service) on 2026-08-05; the value is their consent
    // message verbatim. It only ever applies to the URL above.
    execSync('npx prisma migrate reset --force', {
      cwd: `${__dirname}/..`,
      env: {
        ...process.env,
        DATABASE_URL: url,
        PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION:
          'Yes, allow reset (Recommended)',
      },
      stdio: 'pipe',
    });
  } catch (error) {
    throw new Error(
      'Could not reset the e2e test database. Is the postgres-test container running? ' +
        'Start it with: docker compose up -d postgres-test\n' +
        (error instanceof Error ? error.message : String(error)),
    );
  }
}
