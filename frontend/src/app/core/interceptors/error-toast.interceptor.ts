import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/ui/toast/toast.service';

/**
 * Surfaces unexpected failures (network, 5xx) as toasts. Expected statuses
 * (400/401/403/404/409) are handled by components/interceptors and stay quiet.
 */
export const errorToastInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500)) {
        toast.error('Something went wrong. Please try again.');
      }
      return throwError(() => error);
    }),
  );
};
