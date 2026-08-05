import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../../../common/interfaces/auth-user.interface';

export interface AccessTokenPayload {
  sub: string;
  username: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('jwt.accessSecret'),
    });
  }

  validate(payload: AccessTokenPayload): AuthUser {
    return { id: payload.sub, username: payload.username, role: payload.role };
  }
}
