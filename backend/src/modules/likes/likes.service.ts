import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Idempotent: liking twice is not an error (contract fixes legacy 500 'Already liked'). */
  async like(user: AuthUser, storyId: string): Promise<void> {
    await this.assertStoryExists(storyId);
    await this.prisma.like.upsert({
      where: { userId_storyId: { userId: user.id, storyId } },
      update: {},
      create: { userId: user.id, storyId },
    });
  }

  /** Idempotent: unliking something never liked is not an error. */
  async unlike(user: AuthUser, storyId: string): Promise<void> {
    await this.assertStoryExists(storyId);
    await this.prisma.like.deleteMany({
      where: { userId: user.id, storyId },
    });
  }

  private async assertStoryExists(storyId: string): Promise<void> {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true },
    });
    if (!story) {
      throw new NotFoundException('Story not found');
    }
  }
}
