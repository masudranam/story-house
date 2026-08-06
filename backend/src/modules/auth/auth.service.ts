import { createHash, randomUUID } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { PrismaService } from '../../prisma/prisma.service';
import { UserEntity, userEntitySelect } from '../users/entities/user.entity';
import {
  AuthSessionEntity,
  TokenPairEntity,
} from './entities/auth-tokens.entity';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { RefreshContext } from './strategies/jwt-refresh.strategy';

interface TokenUser {
  id: string;
  username: string;
  tokenVersion: number;
}

@Injectable()
export class AuthService {
  /**
   * bcrypt hash of a throwaway string at the CONFIGURED cost. Compared against
   * when the identifier is unknown so login takes the same time for unknown
   * users and wrong passwords — otherwise response timing is an
   * account-existence oracle. Computed once at boot (sync is fine here).
   */
  private readonly timingEqualizerHash: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.timingEqualizerHash = bcrypt.hashSync(
      'storyhouse-timing-equalizer',
      this.config.getOrThrow<number>('security.bcryptCost'),
    );
  }

  async signup(dto: SignupDto): Promise<UserEntity> {
    const passwordHash = await bcrypt.hash(
      dto.password,
      this.config.getOrThrow<number>('security.bcryptCost'),
    );
    // Duplicate username/email surfaces as Prisma P2002 → 409 via the global filter.
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        username: dto.username,
        email: dto.email,
        passwordHash,
      },
      select: userEntitySelect,
    });
    return new UserEntity(user);
  }

  async login(dto: LoginDto): Promise<AuthSessionEntity> {
    // Explicit select: the hash is needed here, so name exactly what leaves
    // the database rather than relying on later hand-picking (rule 30).
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ username: dto.identifier }, { email: dto.identifier }] },
      select: { ...userEntitySelect, passwordHash: true, tokenVersion: true },
    });
    // Same 401 AND same response time for unknown identifier vs wrong password
    // (contract: no user enumeration — by message or by timing).
    const passwordMatches = await bcrypt.compare(
      dto.password,
      user?.passwordHash ?? this.timingEqualizerHash,
    );
    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.issueTokenPair(user);
    return new AuthSessionEntity({
      ...tokens,
      user: new UserEntity({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    });
  }

  async refresh(ctx: RefreshContext): Promise<TokenPairEntity> {
    const row = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashToken(ctx.token) },
    });
    if (!row || row.revokedAt !== null || row.expiresAt <= new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    // Atomic single-use claim: of N concurrent presentations of the same
    // token, exactly one wins this conditional update (double-spend guard).
    const claimed = await this.prisma.refreshToken.updateMany({
      where: { id: row.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (claimed.count !== 1) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: row.userId },
      select: { id: true, username: true, tokenVersion: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return new TokenPairEntity(await this.issueTokenPair(user));
  }

  /** Idempotent: revokes the token if it belongs to the caller, otherwise a silent no-op. */
  async logout(userId: string, refreshToken: string): Promise<void> {
    const row = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashToken(refreshToken) },
    });
    if (row && row.userId === userId && row.revokedAt === null) {
      await this.prisma.refreshToken.update({
        where: { id: row.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  /**
   * Issues a fresh pair for a user. Public so `changePassword` can hand the
   * acting session new credentials after bumping their token version.
   */
  async issueTokensFor(userId: string): Promise<TokenPairEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true, tokenVersion: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return new TokenPairEntity(await this.issueTokenPair(user));
  }

  private async issueTokenPair(user: TokenUser): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // TTLs come from Joi-validated env as duration strings ('15m', '7d') —
    // the cast narrows string to the ms StringValue union jsonwebtoken expects.
    const accessToken = await this.jwt.signAsync(
      {
        sub: user.id,
        username: user.username,
        tokenVersion: user.tokenVersion,
      },
      {
        secret: this.config.getOrThrow<string>('jwt.accessSecret'),
        expiresIn: this.config.getOrThrow<string>(
          'jwt.accessTtl',
        ) as StringValue,
      },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti: randomUUID() },
      {
        secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
        expiresIn: this.config.getOrThrow<string>(
          'jwt.refreshTtl',
        ) as StringValue,
      },
    );

    const { exp } = this.jwt.decode<{ exp: number }>(refreshToken);
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(exp * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
