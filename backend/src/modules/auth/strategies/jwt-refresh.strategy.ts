import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export interface RefreshContext {
  userId: string;
  jti: string;
  token: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: config.getOrThrow<string>('jwt.refreshSecret'),
      passReqToCallback: true,
    });
  }

  // Signature/expiry are proven here; AuthService still checks the DB row
  // (revocation, rotation) before trusting the token.
  validate(req: Request, payload: RefreshTokenPayload): RefreshContext {
    const body = req.body as { refreshToken?: string };
    return {
      userId: payload.sub,
      jti: payload.jti,
      token: body.refreshToken ?? '',
    };
  }
}
