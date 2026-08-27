import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../auth/auth-store';

/** Login/signup are pointless for a signed-in user — bounce them home. */
export const guestGuard: CanActivateFn = async () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  await store.sessionReady;
  return store.isAuthenticated() ? router.createUrlTree(['/']) : true;
};
