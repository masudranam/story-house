import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Story author view — id/name/username only, never email (contract: PublicUserLite). */
export class AuthorLiteEntity {
  @ApiProperty({ example: '2f9b1f64-1c3a-4d0e-9d2a-0b6f6c1a2b3c' })
  id!: string;

  @ApiProperty({ example: 'Alice Rahman' })
  name!: string;

  @ApiProperty({ example: 'alice' })
  username!: string;
}

export class StoryEntity {
  @ApiProperty({ example: '9d1f0a3e-5b2c-4d7e-8f90-1a2b3c4d5e6f' })
  id!: string;

  @ApiProperty({ example: 'The Lighthouse at the Edge of the Map' })
  title!: string;

  @ApiProperty({ example: 'Everyone in the village said...' })
  content!: string;

  @ApiProperty({ type: AuthorLiteEntity })
  author!: AuthorLiteEntity;

  @ApiProperty({ example: 12 })
  likesCount!: number;

  @ApiProperty({ example: 4 })
  commentsCount!: number;

  @ApiPropertyOptional({
    example: true,
    description:
      'Present on single-story reads for authenticated callers (and false on create); omitted for anonymous readers and in list responses',
  })
  likedByMe?: boolean;

  @ApiProperty({ example: '2026-08-05T10:15:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-05T10:15:00.000Z' })
  updatedAt!: Date;

  constructor(partial: Partial<StoryEntity>) {
    Object.assign(this, partial);
  }
}

/** Prisma select shared by every story read — author lite + grouped counts (no N+1). */
export const storySelect = {
  id: true,
  title: true,
  content: true,
  author: { select: { id: true, name: true, username: true } },
  _count: { select: { likes: true, comments: true } },
  createdAt: true,
  updatedAt: true,
} as const;

export interface StoryRow {
  id: string;
  title: string;
  content: string;
  author: AuthorLiteEntity;
  _count: { likes: number; comments: number };
  createdAt: Date;
  updatedAt: Date;
}

export function toStoryEntity(row: StoryRow, likedByMe?: boolean): StoryEntity {
  return new StoryEntity({
    id: row.id,
    title: row.title,
    content: row.content,
    author: row.author,
    likesCount: row._count.likes,
    commentsCount: row._count.comments,
    ...(likedByMe === undefined ? {} : { likedByMe }),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}
