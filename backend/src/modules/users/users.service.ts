import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { buildMeta, PaginationMetaDto } from '../../common/dto/paginated.dto';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { TokenPairEntity } from '../auth/entities/auth-tokens.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import {
  PublicUserEntity,
  publicUserSelect,
} from './entities/public-user.entity';
import { StatsEntity } from './entities/stats.entity';
import { UserEntity, userEntitySelect } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {}

  async getMe(userId: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userEntitySelect,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UserEntity(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto): Promise<UserEntity> {
    // Duplicate username → P2002 → 409; missing user → P2025 → 404 (global filter).
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name, username: dto.username },
      select: userEntitySelect,
    });
    return new UserEntity(user);
  }

  /**
   * Signs out every OTHER session and returns fresh credentials for the
   * caller, so the acting session survives its own password change (the UI
   * promises exactly that). Bumping `tokenVersion` kills previously issued
   * access tokens; revoking refresh tokens kills the rest.
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<TokenPairEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    if (await bcrypt.compare(dto.newPassword, user.passwordHash)) {
      throw new BadRequestException(
        'New password must differ from the current one',
      );
    }
    const passwordHash = await bcrypt.hash(
      dto.newPassword,
      this.config.getOrThrow<number>('security.bcryptCost'),
    );
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          passwordChangedAt: new Date(),
          tokenVersion: { increment: 1 },
        },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    // Re-credential the caller with the new token version.
    return this.authService.issueTokensFor(userId);
  }

  async deleteMe(user: AuthUser): Promise<void> {
    if (user.role === Role.ADMIN) {
      throw new ForbiddenException('Admins cannot delete their own account');
    }
    // Cascades stories/comments/likes/refresh tokens (schema onDelete: Cascade).
    await this.prisma.user.delete({ where: { id: user.id } });
  }

  async getPublicProfile(id: string): Promise<PublicUserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new PublicUserEntity(user);
  }

  async adminList(
    query: UsersQueryDto,
  ): Promise<{ data: UserEntity[]; meta: PaginationMetaDto }> {
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.search
        ? {
            OR: [
              { username: { contains: query.search, mode: 'insensitive' } },
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: userEntitySelect,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      data: rows.map((row) => new UserEntity(row)),
      meta: buildMeta(query.page, query.limit, totalItems),
    };
  }

  async adminDelete(actor: AuthUser, id: string): Promise<void> {
    if (actor.id === id) {
      throw new ForbiddenException('Admins cannot delete their own account');
    }
    // Missing id → P2025 → 404 via the global filter.
    await this.prisma.user.delete({ where: { id } });
  }

  async stats(): Promise<StatsEntity> {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [
      totalUsers,
      totalStories,
      totalComments,
      newUsersThisWeek,
      newStoriesThisWeek,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.story.count(),
      this.prisma.comment.count(),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.story.count({ where: { createdAt: { gte: weekAgo } } }),
    ]);
    return new StatsEntity({
      totalUsers,
      totalStories,
      totalComments,
      newUsersThisWeek,
      newStoriesThisWeek,
    });
  }
}
