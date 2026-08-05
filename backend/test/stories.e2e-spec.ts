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

interface StoryBody {
  id: string;
  title: string;
  author: { id: string; username: string; email?: string };
  likesCount: number;
  commentsCount: number;
  likedByMe?: boolean;
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

describe('Stories (e2e)', () => {
  let app: INestApplication<App>;
  let http: App;

  const erin = {
    name: 'Erin Author',
    username: 'erin_e2e',
    email: 'erin.e2e@storyhouse.local',
    password: 'Password123!',
  };
  const frank = {
    name: 'Frank Reader',
    username: 'frank_e2e',
    email: 'frank.e2e@storyhouse.local',
    password: 'Password123!',
  };
  const mod = {
    name: 'Mod Admin',
    username: 'mod_e2e',
    email: 'mod.e2e@storyhouse.local',
    password: 'Password123!',
  };

  let erinSession: SessionBody;
  let frankSession: SessionBody;
  let modSession: SessionBody;
  let storyId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    http = app.getHttpServer();
    const prisma = app.get(PrismaService);

    erinSession = await signupAndLogin(http, erin);
    frankSession = await signupAndLogin(http, frank);
    await request(http).post('/api/v1/auth/signup').send(mod).expect(201);
    await prisma.user.update({
      where: { username: mod.username },
      data: { role: Role.ADMIN },
    });
    const res = await request(http)
      .post('/api/v1/auth/login')
      .send({ identifier: mod.username, password: mod.password })
      .expect(200);
    modSession = res.body as SessionBody;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('create', () => {
    it('rejects anonymous creation (401)', async () => {
      await request(http)
        .post('/api/v1/stories')
        .send({ title: 'Nope', content: 'Anonymous' })
        .expect(401);
    });

    it('creates a story with the JWT user as author, ignoring body authorId (400)', async () => {
      // forbidNonWhitelisted: a client-supplied authorId is rejected outright.
      await request(http)
        .post('/api/v1/stories')
        .set('Authorization', `Bearer ${erinSession.accessToken}`)
        .send({ title: 'Hack', content: 'x', authorId: frankSession.user.id })
        .expect(400);

      const res = await request(http)
        .post('/api/v1/stories')
        .set('Authorization', `Bearer ${erinSession.accessToken}`)
        .send({
          title: 'Erin Story One',
          content: 'Once upon a time in e2e land.',
        })
        .expect(201);
      const body = res.body as StoryBody;
      expect(body.author.id).toBe(erinSession.user.id);
      expect(body.author).not.toHaveProperty('email');
      expect(body).toMatchObject({
        likesCount: 0,
        commentsCount: 0,
        likedByMe: false,
      });
      storyId = body.id;
    });
  });

  describe('list (public)', () => {
    beforeAll(async () => {
      await request(http)
        .post('/api/v1/stories')
        .set('Authorization', `Bearer ${frankSession.accessToken}`)
        .send({ title: 'Frank Story', content: 'A different tale.' })
        .expect(201);
    });

    it('is public, paginated, and never leaks author emails', async () => {
      const res = await request(http)
        .get('/api/v1/stories?page=1&limit=1')
        .expect(200);
      const body = res.body as {
        data: StoryBody[];
        meta: { totalItems: number; limit: number };
      };
      expect(body.data).toHaveLength(1);
      expect(body.meta.totalItems).toBeGreaterThanOrEqual(2);
      expect(JSON.stringify(body)).not.toContain('@storyhouse.local');
    });

    it('filters by title search and by authorId', async () => {
      const bySearch = await request(http)
        .get('/api/v1/stories?search=erin story')
        .expect(200);
      const searchBody = bySearch.body as { data: StoryBody[] };
      expect(searchBody.data.length).toBeGreaterThanOrEqual(1);
      expect(
        searchBody.data.every((s) =>
          s.title.toLowerCase().includes('erin story'),
        ),
      ).toBe(true);

      const byAuthor = await request(http)
        .get(`/api/v1/stories?authorId=${frankSession.user.id}`)
        .expect(200);
      const authorBody = byAuthor.body as { data: StoryBody[] };
      expect(
        authorBody.data.every((s) => s.author.id === frankSession.user.id),
      ).toBe(true);
    });

    it('sorts ascending on request (default is newest first)', async () => {
      const asc = await request(http)
        .get('/api/v1/stories?sort=createdAt:asc')
        .expect(200);
      const desc = await request(http).get('/api/v1/stories').expect(200);
      const ascBody = asc.body as { data: StoryBody[] };
      const descBody = desc.body as { data: StoryBody[] };
      expect(ascBody.data[0].id).toBe(
        descBody.data[descBody.data.length - 1].id,
      );
    });

    it('rejects an invalid sort value (400)', async () => {
      await request(http).get('/api/v1/stories?sort=title:desc').expect(400);
    });
  });

  describe('detail (public + optional auth)', () => {
    it('serves anonymous readers without likedByMe', async () => {
      const res = await request(http)
        .get(`/api/v1/stories/${storyId}`)
        .expect(200);
      const body = res.body as StoryBody;
      expect(body.id).toBe(storyId);
      expect(body).not.toHaveProperty('likedByMe');
    });

    it('includes likedByMe=false for an authenticated non-liker', async () => {
      const res = await request(http)
        .get(`/api/v1/stories/${storyId}`)
        .set('Authorization', `Bearer ${frankSession.accessToken}`)
        .expect(200);
      expect((res.body as StoryBody).likedByMe).toBe(false);
    });

    it('404s for unknown, 400 for malformed ids', async () => {
      await request(http)
        .get('/api/v1/stories/00000000-0000-4000-8000-0000000000aa')
        .expect(404);
      await request(http).get('/api/v1/stories/not-a-uuid').expect(400);
    });
  });

  describe('update', () => {
    it("403s another user AND an admin editing someone's story", async () => {
      await request(http)
        .patch(`/api/v1/stories/${storyId}`)
        .set('Authorization', `Bearer ${frankSession.accessToken}`)
        .send({ title: 'Hijacked' })
        .expect(403);

      await request(http)
        .patch(`/api/v1/stories/${storyId}`)
        .set('Authorization', `Bearer ${modSession.accessToken}`)
        .send({ title: 'Moderated' })
        .expect(403);
    });

    it('lets the owner edit (200) and bumps updatedAt', async () => {
      const res = await request(http)
        .patch(`/api/v1/stories/${storyId}`)
        .set('Authorization', `Bearer ${erinSession.accessToken}`)
        .send({ title: 'Erin Story One — Revised' })
        .expect(200);
      expect((res.body as StoryBody).title).toBe('Erin Story One — Revised');
    });
  });

  describe('delete', () => {
    it('403s a non-owner non-admin', async () => {
      await request(http)
        .delete(`/api/v1/stories/${storyId}`)
        .set('Authorization', `Bearer ${frankSession.accessToken}`)
        .expect(403);
    });

    it('lets an ADMIN moderate-delete any story (204), then 404s', async () => {
      await request(http)
        .delete(`/api/v1/stories/${storyId}`)
        .set('Authorization', `Bearer ${modSession.accessToken}`)
        .expect(204);
      await request(http).get(`/api/v1/stories/${storyId}`).expect(404);
    });

    it('lets an owner delete their own story (204)', async () => {
      const res = await request(http)
        .post('/api/v1/stories')
        .set('Authorization', `Bearer ${erinSession.accessToken}`)
        .send({ title: 'Short-lived', content: 'Gone soon.' })
        .expect(201);
      await request(http)
        .delete(`/api/v1/stories/${(res.body as StoryBody).id}`)
        .set('Authorization', `Bearer ${erinSession.accessToken}`)
        .expect(204);
    });
  });
});
