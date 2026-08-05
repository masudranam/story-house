import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/** Global access-token guard (rule 20-rest-api): protected by default, @Public() opts out. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isPublic) {
      return (await super.canActivate(context)) as boolean;
    }
    // Public routes still get OPTIONAL auth: a valid bearer token attaches
    // request.user (e.g. `likedByMe` on public story reads); a missing or
    // invalid one never fails the request.
    try {
      await super.canActivate(context);
    } catch {
      // anonymous access — intentionally ignored
    }
    return true;
  }
}
