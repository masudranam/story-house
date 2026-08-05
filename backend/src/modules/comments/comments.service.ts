import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { buildMeta, PaginationMetaDto } from '../../common/dto/paginated.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { CommentsQueryDto } from './dto/comments-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentEntity, commentSelect } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForStory(
    storyId: string,
    query: PaginationQueryDto,
  ): Promise<{ data: CommentEntity[]; meta: PaginationMetaDto }> {
    await this.assertStoryExists(storyId);
    const where: Prisma.CommentWhereInput = { storyId };
    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where,
        select: commentSelect,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.comment.count({ where }),
    ]);
    return {
      data: rows.map((row) => new CommentEntity(row)),
      meta: buildMeta(query.page, query.limit, totalItems),
    };
  }

  async createForStory(
    user: AuthUser,
    storyId: string,
    dto: CreateCommentDto,
  ): Promise<CommentEntity> {
    await this.assertStoryExists(storyId);
    const row = await this.prisma.comment.create({
      data: { content: dto.content, storyId, authorId: user.id },
      select: commentSelect,
    });
    return new CommentEntity(row);
  }

  async update(
    user: AuthUser,
    id: string,
    dto: UpdateCommentDto,
  ): Promise<CommentEntity> {
    await this.assertOwnership(id, user, { allowAdmin: false });
    const row = await this.prisma.comment.update({
      where: { id },
      data: { content: dto.content },
      select: commentSelect,
    });
    return new CommentEntity(row);
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    await this.assertOwnership(id, user, { allowAdmin: true });
    await this.prisma.comment.delete({ where: { id } });
  }

  async adminList(
    query: CommentsQueryDto,
  ): Promise<{ data: CommentEntity[]; meta: PaginationMetaDto }> {
    const where: Prisma.CommentWhereInput = {
      ...(query.storyId ? { storyId: query.storyId } : {}),
      ...(query.search
        ? {
            OR: [
              { content: { contains: query.search, mode: 'insensitive' } },
              {
                author: {
                  username: { contains: query.search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };
    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where,
        select: commentSelect,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.comment.count({ where }),
    ]);
    return {
      data: rows.map((row) => new CommentEntity(row)),
      meta: buildMeta(query.page, query.limit, totalItems),
    };
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

  private async assertOwnership(
    id: string,
    user: AuthUser,
    opts: { allowAdmin: boolean },
  ): Promise<void> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    const isOwner = comment.authorId === user.id;
    const isModerator = opts.allowAdmin && user.role === Role.ADMIN;
    if (!isOwner && !isModerator) {
      throw new ForbiddenException('You may only modify your own comments');
    }
  }
}
