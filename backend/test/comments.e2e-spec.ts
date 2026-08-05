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
  user: { id: string };
}
interface CommentBody {
  id: string;
  content: string;
  storyId: string;
  author: { id: string; username: string };
  createdAt: string;
  updatedAt: string;
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

describe('Comments (e2e)', () => {
  let app: INestApplication<App>;
  let http: App;

  const gina = {
    name: 'Gina Writer',
    username: 'gina_e2e',
    email: 'gina.e2e@storyhouse.local',
    password: 'Password123!',
  };
  const hank = {
    name: 'Hank Commenter',
    username: 'hank_e2e',
    email: 'hank.e2e@storyhouse.local',
    password: 'Password123!',
  };
  const chief = {
    name: 'Chief Admin',
    username: 'chief_e2e',
    email: 'chief.e2e@storyhouse.local',
    password: 'Password123!',
  };

  let ginaSession: SessionBody;
  let hankSession: SessionBody;
  let adminSession: SessionBody;
  let storyId: string;
  let commentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    http = app.getHttpServer();
    const prisma = app.get(PrismaService);

    ginaSession = await signupAndLogin(http, gina);
    hankSession = await signupAndLogin(http, hank);
    await request(http).post('/api/v1/auth/signup').send(chief).expect(201);
    await prisma.user.update({
      where: { username: chief.username },
      data: { role: Role.ADMIN },
    });
    const res = await request(http)
      .post('/api/v1/auth/login')
      .send({ identifier: chief.username, password: chief.password })
      .expect(200);
    adminSession = res.body as SessionBody;

    const story = await request(http)
      .post('/api/v1/stories')
      .set('Authorization', `Bearer ${ginaSession.accessToken}`)
      .send({ title: 'Gina Commentable Story', content: 'Please comment.' })
      .expect(201);
    storyId = (story.body as { id: string }).id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /stories/:id/comments', () => {
    it('rejects anonymous commenting (401)', async () => {
      await request(http)
        .post(`/api/v1/stories/${storyId}/comments`)
        .send({ content: 'anon' })
        .expect(401);
    });

    it('404s for an unknown story', async () => {
      await request(http)
        .post('/api/v1/stories/00000000-0000-4000-8000-0000000000bb/comments')
        .set('Authorization', `Bearer ${hankSession.accessToken}`)
        .send({ content: 'ghost story' })
        .expect(404);
    });

    it('creates a comment authored by the JWT user (201)', async () => {
      const res = await request(http)
        .post(`/api/v1/stories/${storyId}/comments`)
        .set('Authorization', `Bearer ${hankSession.accessToken}`)
        .send({ content: 'First!' })
        .expect(201);
      const body = res.body as CommentBody;
      expect(body.author.id).toBe(hankSession.user.id);
      expect(body.storyId).toBe(storyId);
      commentId = body.id;
    });

    it('rejects over-long content (400)', async () => {
      await request(http)
        .post(`/api/v1/stories/${storyId}/comments`)
        .set('Authorization', `Bearer ${hankSession.accessToken}`)
        .send({ content: 'x'.repeat(2001) })
        .expect(400);
    });
  });

  describe('GET /stories/:id/comments', () => {
    it('is public, newest first, paginated', async () => {
      await request(http)
        .post(`/api/v1/stories/${storyId}/comments`)
        .set('Authorization', `Bearer ${ginaSession.accessToken}`)
        .send({ content: 'Second comment' })
        .expect(201);

      const res = await request(http)
        .get(`/api/v1/stories/${storyId}/comments?page=1&limit=10`)
        .expect(200);
      const body = res.body as {
        data: CommentBody[];
        meta: { totalItems: number };
      };
      expect(body.meta.totalItems).toBe(2);
      expect(body.data[0].content).toBe('Second comment');
      expect(JSON.stringify(body)).not.toContain('@storyhouse.local');
    });

    it('404s for an unknown story', async () => {
      await request(http)
        .get('/api/v1/stories/00000000-0000-4000-8000-0000000000bb/comments')
        .expect(404);
    });
  });

  describe('PATCH /comments/:id', () => {
    it('403s another user and an admin (edit is owner-only)', async () => {
      await request(http)
        .patch(`/api/v1/comments/${commentId}`)
        .set('Authorization', `Bearer ${ginaSession.accessToken}`)
        .send({ content: 'hijack' })
        .expect(403);
      await request(http)
        .patch(`/api/v1/comments/${commentId}`)
        .set('Authorization', `Bearer ${adminSession.accessToken}`)
        .send({ content: 'moderated edit' })
        .expect(403);
    });

    it('lets the owner edit and bumps updatedAt', async () => {
      const before = await request(http)
        .get(`/api/v1/stories/${storyId}/comments`)
        .expect(200);
      const beforeRow = (before.body as { data: CommentBody[] }).data.find(
        (c) => c.id === commentId,
      );

      const res = await request(http)
        .patch(`/api/v1/comments/${commentId}`)
        .set('Authorization', `Bearer ${hankSession.accessToken}`)
        .send({ content: 'First! (edited)' })
        .expect(200);
      const body = res.body as CommentBody;
      expect(body.content).toBe('First! (edited)');
      expect(new Date(body.updatedAt).getTime()).toBeGreaterThan(
        new Date(beforeRow?.updatedAt ?? 0).getTime(),
      );
    });
  });

  describe('DELETE /comments/:id and admin moderation list', () => {
    it('GET /comments is 403 for users, searchable for admins', async () => {
      await request(http)
        .get('/api/v1/comments')
        .set('Authorization', `Bearer ${hankSession.accessToken}`)
        .expect(403);

      const res = await request(http)
        .get(`/api/v1/comments?search=${hank.username}&storyId=${storyId}`)
        .set('Authorization', `Bearer ${adminSession.accessToken}`)
        .expect(200);
      const body = res.body as { data: CommentBody[] };
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data.every((c) => c.storyId === storyId)).toBe(true);
    });

    it('403s a non-owner non-admin delete', async () => {
      await request(http)
        .delete(`/api/v1/comments/${commentId}`)
        .set('Authorization', `Bearer ${ginaSession.accessToken}`)
        .expect(403);
    });

    it('admin moderation delete works (204), then 404', async () => {
      await request(http)
        .delete(`/api/v1/comments/${commentId}`)
        .set('Authorization', `Bearer ${adminSession.accessToken}`)
        .expect(204);
      await request(http)
        .delete(`/api/v1/comments/${commentId}`)
        .set('Authorization', `Bearer ${adminSession.accessToken}`)
        .expect(404);
    });

    it('owner can delete their own comment (204)', async () => {
      const res = await request(http)
        .post(`/api/v1/stories/${storyId}/comments`)
        .set('Authorization', `Bearer ${ginaSession.accessToken}`)
        .send({ content: 'delete me' })
        .expect(201);
      await request(http)
        .delete(`/api/v1/comments/${(res.body as CommentBody).id}`)
        .set('Authorization', `Bearer ${ginaSession.accessToken}`)
        .expect(204);
    });
  });
});
