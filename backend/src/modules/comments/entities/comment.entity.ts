import { ApiProperty } from '@nestjs/swagger';
import { AuthorLiteEntity } from '../../stories/entities/story.entity';

export class CommentEntity {
  @ApiProperty({ example: 'c3d4e5f6-1a2b-4c5d-8e9f-0a1b2c3d4e5f' })
  id!: string;

  @ApiProperty({ example: 'That opening line gave me chills!' })
  content!: string;

  @ApiProperty({ example: '9d1f0a3e-5b2c-4d7e-8f90-1a2b3c4d5e6f' })
  storyId!: string;

  @ApiProperty({ type: AuthorLiteEntity })
  author!: AuthorLiteEntity;

  @ApiProperty({ example: '2026-08-05T10:15:00.000Z' })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-05T10:20:00.000Z',
    description:
      'Bumped on edit (legacy comments had no edit timestamp — fixed)',
  })
  updatedAt!: Date;

  constructor(partial: Partial<CommentEntity>) {
    Object.assign(this, partial);
  }
}

/** Prisma select matching CommentEntity — author lite, never email. */
export const commentSelect = {
  id: true,
  content: true,
  storyId: true,
  author: { select: { id: true, name: true, username: true } },
  createdAt: true,
  updatedAt: true,
} as const;
