import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../../../common/interfaces/auth-user.interface';
import { PrismaService } from '../../../prisma/prisma.service';

export interface AccessTokenPayload {
  sub: string;
  username: string;
  iat: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('jwt.accessSecret'),
    });
  }

  /**
   * Resolves identity from the DB rather than trusting the token's claims:
   * - a deleted user's token stops working immediately;
   * - a role change takes effect immediately (no stale ADMIN for 15m);
   * - tokens issued before the last password change are rejected, which is
   *   what makes "changing your password signs out other sessions" true for
   *   access tokens too (refresh tokens are revoked separately).
   */
  async validate(payload: AccessTokenPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true, role: true, passwordChangedAt: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    // `iat` is in seconds; allow the same second to avoid a rounding race.
    if (
      user.passwordChangedAt &&
      payload.iat * 1000 < user.passwordChangedAt.getTime() - 1000
    ) {
      throw new UnauthorizedException(
        'Token issued before the last password change',
      );
    }
    return { id: user.id, username: user.username, role: user.role };
  }
}
