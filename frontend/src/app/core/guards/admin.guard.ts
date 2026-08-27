import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../auth/auth-store';

/** ADMIN-only routes (the legacy app shipped an admin panel with no guard at all). */
export const adminGuard: CanActivateFn = async () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  await store.sessionReady;
  return store.isAdmin() ? true : router.createUrlTree(['/']);
};
