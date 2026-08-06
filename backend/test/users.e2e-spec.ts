import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';
import { PrismaService } from './../src/prisma/prisma.service';

interface SessionBody {
  accessToken: string;
  refreshToken: string;
  user: { id: string };
}

async function signupAndLogin(
  http: App,
  user: { name: string; username: string; email: string; password: string },
): Promise<SessionBody> {
  await request(http).post('/api/v1/auth/signup').send(user).expect(201);
  const res = await request(http)
    .post('/api/v1/auth/login')
    .send({ identifier: user.username, password: user.password })
    .expect(200);
  return res.body as SessionBody;
}

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let http: App;
  let prisma: PrismaService;

  const carol = {
    name: 'Carol Akter',
    username: 'carol_e2e',
    email: 'carol.e2e@storyhouse.local',
    password: 'Password123!',
  };
  const dave = {
    name: 'Dave Karim',
    username: 'dave_e2e',
    email: 'dave.e2e@storyhouse.local',
    password: 'Password123!',
  };
  const root = {
    name: 'Root Admin',
    username: 'root_e2e',
    email: 'root.e2e@storyhouse.local',
    password: 'Password123!',
  };

  let carolSession: SessionBody;
  let daveSession: SessionBody;
  let adminSession: SessionBody;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    http = app.getHttpServer();
    prisma = app.get(PrismaService);

    carolSession = await signupAndLogin(http, carol);
    daveSession = await signupAndLogin(http, dave);
    // Promote one account to ADMIN directly in the test DB, then log in again
    // so the JWT carries the ADMIN role claim.
    await request(http).post('/api/v1/auth/signup').send(root).expect(201);
    await prisma.user.update({
      where: { username: root.username },
      data: { role: Role.ADMIN },
    });
    const res = await request(http)
      .post('/api/v1/auth/login')
      .send({ identifier: root.username, password: root.password })
      .expect(200);
    adminSession = res.body as SessionBody;
  });

  afterAll(async () => {
    await app.close();
  });

  const bearer = (s: SessionBody) => `Bearer ${s.accessToken}`;

  describe('/users/me', () => {
    it('GET returns own profile with email, without any hash', async () => {
      const res = await request(http)
        .get('/api/v1/users/me')
        .set('Authorization', bearer(carolSession))
        .expect(200);
      expect(res.body).toMatchObject({
        username: carol.username,
        email: carol.email,
      });
      expect(JSON.stringify(res.body)).not.toContain('assword');
    });

    it('PATCH updates the name; duplicate username gives 409', async () => {
      await request(http)
        .patch('/api/v1/users/me')
        .set('Authorization', bearer(carolSession))
        .send({ name: 'Carol A.' })
        .expect(200);

      await request(http)
        .patch('/api/v1/users/me')
        .set('Authorization', bearer(carolSession))
        .send({ username: dave.username })
        .expect(409);
    });

    it('PATCH with unknown fields is rejected (400, forbidNonWhitelisted)', async () => {
      await request(http)
        .patch('/api/v1/users/me')
        .set('Authorization', bearer(carolSession))
        .send({ role: 'ADMIN' })
        .expect(400);
    });

    it('PATCH /users/me/password: wrong current 401, same-as-current 400, success 204 revokes refresh tokens', async () => {
      await request(http)
        .patch('/api/v1/users/me/password')
        .set('Authorization', bearer(daveSession))
        .send({
          currentPassword: 'WrongPass123!',
          newPassword: 'NewPassword456!',
        })
        .expect(401);

      await request(http)
        .patch('/api/v1/users/me/password')
        .set('Authorization', bearer(daveSession))
        .send({ currentPassword: dave.password, newPassword: dave.password })
        .expect(400);

      await request(http)
        .patch('/api/v1/users/me/password')
        .set('Authorization', bearer(daveSession))
        .send({
          currentPassword: dave.password,
          newPassword: 'NewPassword456!',
        })
        .expect(204);

      // Old refresh token was revoked by the password change.
      await request(http)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: daveSession.refreshToken })
        .expect(401);

      // New password works; old one doesn't.
      await request(http)
        .post('/api/v1/auth/login')
        .send({ identifier: dave.username, password: dave.password })
        .expect(401);
      const res = await request(http)
        .post('/api/v1/auth/login')
        .send({ identifier: dave.username, password: 'NewPassword456!' })
        .expect(200);
      daveSession = res.body as SessionBody;
    });
  });

  describe('/users/:id public profile', () => {
    it('returns the profile WITHOUT email', async () => {
      const res = await request(http)
        .get(`/api/v1/users/${daveSession.user.id}`)
        .set('Authorization', bearer(carolSession))
        .expect(200);
      expect(res.body).toMatchObject({ username: dave.username });
      expect(res.body).not.toHaveProperty('email');
    });

    it('404 for an unknown uuid, 400 for a malformed one', async () => {
      await request(http)
        .get('/api/v1/users/00000000-0000-4000-8000-0000000000ff')
        .set('Authorization', bearer(carolSession))
        .expect(404);
      await request(http)
        .get('/api/v1/users/not-a-uuid')
        .set('Authorization', bearer(carolSession))
        .expect(400);
    });
  });

  describe('admin endpoints', () => {
    it('GET /users is 403 for a regular user, paginated {data, meta} for an admin', async () => {
      await request(http)
        .get('/api/v1/users')
        .set('Authorization', bearer(carolSession))
        .expect(403);

      const res = await request(http)
        .get('/api/v1/users?page=1&limit=2&search=e2e')
        .set('Authorization', bearer(adminSession))
        .expect(200);
      const body = res.body as {
        data: unknown[];
        meta: { totalItems: number };
      };
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.meta).toMatchObject({ page: 1, limit: 2 });
      expect(body.meta.totalItems).toBeGreaterThanOrEqual(3);
    });

    it('GET /users/stats is admin-only and returns all five counters', async () => {
      await request(http)
        .get('/api/v1/users/stats')
        .set('Authorization', bearer(carolSession))
        .expect(403);

      const res = await request(http)
        .get('/api/v1/users/stats')
        .set('Authorization', bearer(adminSession))
        .expect(200);
      expect(res.body).toMatchObject({
        totalUsers: expect.any(Number) as number,
        totalStories: expect.any(Number) as number,
        totalComments: expect.any(Number) as number,
        newUsersThisWeek: expect.any(Number) as number,
        newStoriesThisWeek: expect.any(Number) as number,
      });
    });

    it('DELETE /users/:id: admin cannot delete self (403), can delete others (204), 404 after', async () => {
      await request(http)
        .delete(`/api/v1/users/${adminSession.user.id}`)
        .set('Authorization', bearer(adminSession))
        .expect(403);

      await request(http)
        .delete(`/api/v1/users/${daveSession.user.id}`)
        .set('Authorization', bearer(adminSession))
        .expect(204);

      await request(http)
        .delete(`/api/v1/users/${daveSession.user.id}`)
        .set('Authorization', bearer(adminSession))
        .expect(404);
    });
  });

  describe('password change invalidates existing access tokens', () => {
    it('an access token minted before the change stops working immediately', async () => {
      const victim = {
        name: 'Eve Session',
        username: 'eve_e2e',
        email: 'eve.e2e@storyhouse.local',
        password: 'Password123!',
      };
      const session = await signupAndLogin(http, victim);

      // The token works before the change.
      await request(http)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .expect(200);

      await request(http)
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .send({
          currentPassword: victim.password,
          newPassword: 'NewPassword456!',
        })
        .expect(204);

      // Same token, now rejected — no waiting out the 15-minute TTL.
      await request(http)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .expect(401);
    });
  });

  describe('DELETE /users/me', () => {
    it('admin gets 403; regular user gets 204 and the account is gone', async () => {
      await request(http)
        .delete('/api/v1/users/me')
        .set('Authorization', bearer(adminSession))
        .expect(403);

      await request(http)
        .delete('/api/v1/users/me')
        .set('Authorization', bearer(carolSession))
        .expect(204);

      // The access token now fails authentication rather than reaching the
      // service: JwtStrategy resolves the principal from the DB, and that
      // user no longer exists.
      await request(http)
        .get('/api/v1/users/me')
        .set('Authorization', bearer(carolSession))
        .expect(401);
    });
  });
});
