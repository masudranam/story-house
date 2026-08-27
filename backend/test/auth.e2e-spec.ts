import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';

interface SessionBody {
  accessToken: string;
  refreshToken: string;
  user: Record<string, unknown>;
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let http: App;

  const alice = {
    name: 'Alice Rahman',
    username: 'alice_e2e',
    email: 'alice.e2e@storyhouse.local',
    password: 'Password123!',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    http = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('signup', () => {
    it('creates an account (201) and never returns a password hash', async () => {
      const res = await request(http)
        .post('/api/v1/auth/signup')
        .send(alice)
        .expect(201);

      expect(res.body).toMatchObject({
        username: alice.username,
        email: alice.email,
        role: 'USER',
      });
      expect(JSON.stringify(res.body)).not.toContain('passwordHash');
      expect(JSON.stringify(res.body)).not.toContain('password');
    });

    it('rejects a duplicate username/email with 409', async () => {
      const res = await request(http)
        .post('/api/v1/auth/signup')
        .send(alice)
        .expect(409);
      expect(res.body).toMatchObject({ statusCode: 409, error: 'Conflict' });
    });

    it('rejects an invalid payload with 400 and a message array', async () => {
      const res = await request(http)
        .post('/api/v1/auth/signup')
        .send({
          name: '',
          username: 'UPPER CASE',
          email: 'not-an-email',
          password: 'short',
        })
        .expect(400);
      const body = res.body as { message: unknown };
      expect(Array.isArray(body.message)).toBe(true);
      expect(res.body).toMatchObject({ statusCode: 400, error: 'Bad Request' });
    });
  });

  describe('login', () => {
    it('rejects wrong credentials with 401', async () => {
      await request(http)
        .post('/api/v1/auth/login')
        .send({ identifier: alice.username, password: 'WrongPass123!' })
        .expect(401);
    });

    it('logs in by username AND by email, returning bare tokens (no Bearer prefix)', async () => {
      const byUsername = await request(http)
        .post('/api/v1/auth/login')
        .send({ identifier: alice.username, password: alice.password })
        .expect(200);
      const body = byUsername.body as SessionBody;
      expect(body.accessToken).not.toMatch(/^Bearer /);
      expect(body.refreshToken).toBeDefined();
      expect(body.user).toMatchObject({ username: alice.username });

      await request(http)
        .post('/api/v1/auth/login')
        .send({ identifier: alice.email, password: alice.password })
        .expect(200);
    });
  });

  describe('token lifecycle: refresh rotation, protected routes, logout', () => {
    let session: SessionBody;

    beforeAll(async () => {
      const res = await request(http)
        .post('/api/v1/auth/login')
        .send({ identifier: alice.username, password: alice.password })
        .expect(200);
      session = res.body as SessionBody;
    });

    it('rejects a protected route without a token (401)', async () => {
      await request(http)
        .post('/api/v1/auth/logout')
        .send({ refreshToken: 'x' })
        .expect(401);
    });

    it('rejects a garbage bearer token (401)', async () => {
      await request(http)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer not-a-jwt')
        .send({ refreshToken: session.refreshToken })
        .expect(401);
    });

    it('refresh rotates the token: new pair works, old refresh token dies', async () => {
      const first = await request(http)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: session.refreshToken })
        .expect(200);
      const rotated = first.body as SessionBody;
      expect(rotated.refreshToken).not.toBe(session.refreshToken);

      // Reusing the consumed token must fail (single-use rotation).
      await request(http)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: session.refreshToken })
        .expect(401);

      session = {
        ...session,
        refreshToken: rotated.refreshToken,
        accessToken: rotated.accessToken,
      };
    });

    it('rejects a syntactically invalid refresh token (401)', async () => {
      await request(http)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'garbage' })
        .expect(401);
    });

    it('logout (204) revokes the refresh token so it can no longer refresh', async () => {
      await request(http)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({ refreshToken: session.refreshToken })
        .expect(204);

      await request(http)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: session.refreshToken })
        .expect(401);
    });

    it('logout is idempotent: revoking again still returns 204', async () => {
      await request(http)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({ refreshToken: session.refreshToken })
        .expect(204);
    });
  });
});
