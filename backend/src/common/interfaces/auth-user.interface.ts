import { Role } from '@prisma/client';

/** Shape attached to request.user by the JWT strategy (Phase 2). */
export interface AuthUser {
  id: string;
  username: string;
  role: Role;
}
