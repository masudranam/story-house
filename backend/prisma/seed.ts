/**
 * Idempotent dev seed (rule 30-prisma): one admin, three users, sample
 * stories/comments/likes. Fixed UUIDs make re-runs upsert instead of duplicate.
 * Run: npx prisma db seed
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const IDS = {
  admin: '00000000-0000-4000-8000-000000000001',
  alice: '00000000-0000-4000-8000-000000000002',
  bob: '00000000-0000-4000-8000-000000000003',
  carol: '00000000-0000-4000-8000-000000000004',
  story1: '00000000-0000-4000-8000-000000000101',
  story2: '00000000-0000-4000-8000-000000000102',
  story3: '00000000-0000-4000-8000-000000000103',
  comment1: '00000000-0000-4000-8000-000000000201',
  comment2: '00000000-0000-4000-8000-000000000202',
  comment3: '00000000-0000-4000-8000-000000000203',
} as const;

// Dev-only credential, documented for local login. Never reuse outside dev.
const DEV_PASSWORD = 'Password123!';

async function main(): Promise<void> {
  const cost = Number(process.env.BCRYPT_COST ?? 12);
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, cost);

  const users = [
    {
      id: IDS.admin,
      name: 'Site Admin',
      username: 'admin',
      email: 'admin@storyhouse.local',
      role: Role.ADMIN,
    },
    {
      id: IDS.alice,
      name: 'Alice Rahman',
      username: 'alice',
      email: 'alice@storyhouse.local',
      role: Role.USER,
    },
    {
      id: IDS.bob,
      name: 'Bob Hasan',
      username: 'bob',
      email: 'bob@storyhouse.local',
      role: Role.USER,
    },
    {
      id: IDS.carol,
      name: 'Carol Akter',
      username: 'carol',
      email: 'carol@storyhouse.local',
      role: Role.USER,
    },
  ];
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { name: user.name, role: user.role },
      create: { ...user, passwordHash },
    });
  }

  const stories = [
    {
      id: IDS.story1,
      authorId: IDS.alice,
      title: 'The Lighthouse at the Edge of the Map',
      content:
        'Everyone in the village said the lighthouse had been dark for forty years. That was before the night I saw it blink twice, slow and deliberate, like something waking up...',
    },
    {
      id: IDS.story2,
      authorId: IDS.bob,
      title: 'Notes From a Commuter Train',
      content:
        'Every morning the same faces, the same seats, the same silence. Then one Tuesday a stranger left a notebook behind, and the first page had my name on it...',
    },
    {
      id: IDS.story3,
      authorId: IDS.carol,
      title: 'Recipes My Grandmother Never Wrote Down',
      content:
        'She measured in handfuls and pinches, in "until it smells right". This is my attempt to reconstruct the impossible: a taste of a kitchen that no longer exists...',
    },
  ];
  for (const story of stories) {
    await prisma.story.upsert({
      where: { id: story.id },
      update: { title: story.title, content: story.content },
      create: story,
    });
  }

  const comments = [
    {
      id: IDS.comment1,
      storyId: IDS.story1,
      authorId: IDS.bob,
      content: 'That opening line gave me chills. More please!',
    },
    {
      id: IDS.comment2,
      storyId: IDS.story1,
      authorId: IDS.carol,
      content: 'I grew up near a lighthouse — this feels true.',
    },
    {
      id: IDS.comment3,
      storyId: IDS.story3,
      authorId: IDS.alice,
      content: 'The "until it smells right" detail is perfect.',
    },
  ];
  for (const comment of comments) {
    await prisma.comment.upsert({
      where: { id: comment.id },
      update: { content: comment.content },
      create: comment,
    });
  }

  const likes = [
    { userId: IDS.bob, storyId: IDS.story1 },
    { userId: IDS.carol, storyId: IDS.story1 },
    { userId: IDS.admin, storyId: IDS.story1 },
    { userId: IDS.alice, storyId: IDS.story3 },
  ];
  for (const like of likes) {
    await prisma.like.upsert({
      where: { userId_storyId: { userId: like.userId, storyId: like.storyId } },
      update: {},
      create: like,
    });
  }

  console.log(
    `Seeded ${users.length} users, ${stories.length} stories, ${comments.length} comments, ${likes.length} likes.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => void prisma.$disconnect());
