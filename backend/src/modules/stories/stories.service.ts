import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { buildMeta, PaginationMetaDto } from '../../common/dto/paginated.dto';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { StoriesQueryDto } from './dto/stories-query.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import {
  StoryEntity,
  StoryRow,
  storySelect,
  toStoryEntity,
} from './entities/story.entity';

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    query: StoriesQueryDto,
  ): Promise<{ data: StoryEntity[]; meta: PaginationMetaDto }> {
    const where: Prisma.StoryWhereInput = {
      ...(query.authorId ? { authorId: query.authorId } : {}),
      ...(query.search
        ? { title: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.story.findMany({
        where,
        select: storySelect,
        orderBy: { createdAt: query.sort === 'createdAt:asc' ? 'asc' : 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.story.count({ where }),
    ]);
    return {
      data: (rows as StoryRow[]).map((row) => toStoryEntity(row)),
      meta: buildMeta(query.page, query.limit, totalItems),
    };
  }

  async findOne(id: string, user?: AuthUser): Promise<StoryEntity> {
    const row = await this.prisma.story.findUnique({
      where: { id },
      select: storySelect,
    });
    if (!row) {
      throw new NotFoundException('Story not found');
    }
    if (!user) {
      return toStoryEntity(row);
    }
    const liked = await this.prisma.like.findUnique({
      where: { userId_storyId: { userId: user.id, storyId: id } },
      select: { userId: true },
    });
    return toStoryEntity(row, liked !== null);
  }

  async create(user: AuthUser, dto: CreateStoryDto): Promise<StoryEntity> {
    const row = await this.prisma.story.create({
      data: { title: dto.title, content: dto.content, authorId: user.id },
      select: storySelect,
    });
    return toStoryEntity(row, false);
  }

  async update(
    user: AuthUser,
    id: string,
    dto: UpdateStoryDto,
  ): Promise<StoryEntity> {
    await this.assertOwnership(id, user, { allowAdmin: false });
    const row = await this.prisma.story.update({
      where: { id },
      data: { title: dto.title, content: dto.content },
      select: storySelect,
    });
    return toStoryEntity(row);
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    await this.assertOwnership(id, user, { allowAdmin: true });
    await this.prisma.story.delete({ where: { id } });
  }

  /** 404 for missing stories, 403 for non-owners (admin bypass only where moderation allows). */
  private async assertOwnership(
    id: string,
    user: AuthUser,
    opts: { allowAdmin: boolean },
  ): Promise<void> {
    const story = await this.prisma.story.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!story) {
      throw new NotFoundException('Story not found');
    }
    const isOwner = story.authorId === user.id;
    const isModerator = opts.allowAdmin && user.role === Role.ADMIN;
    if (!isOwner && !isModerator) {
      throw new ForbiddenException('You may only modify your own stories');
    }
  }
}
