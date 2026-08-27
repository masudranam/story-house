import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../../../common/interfaces/auth-user.interface';
import { PrismaService } from '../../../prisma/prisma.service';

export interface AccessTokenPayload {
  sub: string;
  username: string;
  tokenVersion: number;
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
   * - a stale `tokenVersion` is rejected, which is what makes a password
   *   change invalidate previously issued access tokens.
   *
   * The version is an integer compare on purpose: comparing `iat` against a
   * timestamp depends on wall-clock resolution and leaves a sub-second window
   * where a token minted just before the change still passes.
   */
  async validate(payload: AccessTokenPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true, role: true, tokenVersion: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    if (payload.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException('Token is no longer valid');
    }
    return { id: user.id, username: user.username, role: user.role };
  }
}
