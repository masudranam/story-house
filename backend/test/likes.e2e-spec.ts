import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';

interface SessionBody {
  accessToken: string;
  user: { id: string };
}
interface StoryBody {
  id: string;
  likesCount: number;
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

describe('Likes (e2e)', () => {
  let app: INestApplication<App>;
  let http: App;

  const iris = {
    name: 'Iris Author',
    username: 'iris_e2e',
    email: 'iris.e2e@storyhouse.local',
    password: 'Password123!',
  };
  const jack = {
    name: 'Jack Liker',
    username: 'jack_e2e',
    email: 'jack.e2e@storyhouse.local',
    password: 'Password123!',
  };

  let irisSession: SessionBody;
  let jackSession: SessionBody;
  let storyId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    http = app.getHttpServer();

    irisSession = await signupAndLogin(http, iris);
    jackSession = await signupAndLogin(http, jack);
    const story = await request(http)
      .post('/api/v1/stories')
      .set('Authorization', `Bearer ${irisSession.accessToken}`)
      .send({ title: 'Iris Likeable Story', content: 'Like me.' })
      .expect(201);
    storyId = (story.body as StoryBody).id;
  });

  afterAll(async () => {
    await app.close();
  });

  const getStory = async (session?: SessionBody): Promise<StoryBody> => {
    const req = request(http).get(`/api/v1/stories/${storyId}`);
    if (session) {
      void req.set('Authorization', `Bearer ${session.accessToken}`);
    }
    const res = await req.expect(200);
    return res.body as StoryBody;
  };

  it('rejects anonymous likes (401)', async () => {
    await request(http).put(`/api/v1/stories/${storyId}/like`).expect(401);
  });

  it('404s liking an unknown story', async () => {
    await request(http)
      .put('/api/v1/stories/00000000-0000-4000-8000-0000000000cc/like')
      .set('Authorization', `Bearer ${jackSession.accessToken}`)
      .expect(404);
  });

  it('PUT like is idempotent: two likes count once', async () => {
    await request(http)
      .put(`/api/v1/stories/${storyId}/like`)
      .set('Authorization', `Bearer ${jackSession.accessToken}`)
      .expect(204);
    await request(http)
      .put(`/api/v1/stories/${storyId}/like`)
      .set('Authorization', `Bearer ${jackSession.accessToken}`)
      .expect(204);

    const story = await getStory(jackSession);
    expect(story.likesCount).toBe(1);
    expect(story.likedByMe).toBe(true);
  });

  it('other users and anonymous readers see the count but their own likedByMe', async () => {
    const asIris = await getStory(irisSession);
    expect(asIris.likesCount).toBe(1);
    expect(asIris.likedByMe).toBe(false);

    const anonymous = await getStory();
    expect(anonymous.likesCount).toBe(1);
    expect(anonymous).not.toHaveProperty('likedByMe');
  });

  it('DELETE like is idempotent: unlike twice ends at zero, no error', async () => {
    await request(http)
      .delete(`/api/v1/stories/${storyId}/like`)
      .set('Authorization', `Bearer ${jackSession.accessToken}`)
      .expect(204);
    await request(http)
      .delete(`/api/v1/stories/${storyId}/like`)
      .set('Authorization', `Bearer ${jackSession.accessToken}`)
      .expect(204);

    const story = await getStory(jackSession);
    expect(story.likesCount).toBe(0);
    expect(story.likedByMe).toBe(false);
  });
});
