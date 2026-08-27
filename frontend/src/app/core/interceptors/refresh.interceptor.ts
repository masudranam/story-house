import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { AuthStore } from '../auth/auth-store';
import { isPublicAuthEndpoint } from './auth-endpoints';

/**
 * On a 401 from a protected endpoint: single-flight refresh, then retry the
 * request ONCE with the new token. If the refresh itself fails the session is
 * dead — clear it and land on /login. Only 401 triggers this (the legacy app
 * treated HTTP 500 as session expiry; that was a bug, not parity).
 */
export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AuthStore);
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const is401 = error instanceof HttpErrorResponse && error.status === 401;
      if (!is401 || isPublicAuthEndpoint(req.url) || !store.isAuthenticated()) {
        return throwError(() => error);
      }
      return store.refresh().pipe(
        switchMap((token) => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))),
        catchError((retryError: unknown) => {
          if (retryError instanceof HttpErrorResponse && retryError.status !== 401) {
            return throwError(() => retryError);
          }
          // Tell the user why they were bounced — a silent logout looks broken.
          store.clearSession();
          toast.error('Your session expired — please log in again.');
          void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
          return throwError(() => error);
        }),
      );
    }),
  );
};
