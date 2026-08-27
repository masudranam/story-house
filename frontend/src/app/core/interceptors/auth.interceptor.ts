import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth-store';
import { isPublicAuthEndpoint } from './auth-endpoints';

/** Attaches the in-memory access token to every API request that needs one. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStore).accessToken();
  if (!token || isPublicAuthEndpoint(req.url)) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
