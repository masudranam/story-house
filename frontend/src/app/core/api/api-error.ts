import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api.models';

/** First human-readable message from the backend's { statusCode, message, error } body. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }
  const body = error.error as ApiError | null;
  if (!body?.message) {
    return fallback;
  }
  return Array.isArray(body.message) ? (body.message[0] ?? fallback) : body.message;
}

/** All validation messages (the backend sends an array for 400s). */
export function apiErrorMessages(error: unknown): string[] {
  if (!(error instanceof HttpErrorResponse)) {
    return [];
  }
  const body = error.error as ApiError | null;
  if (!body?.message) {
    return [];
  }
  return Array.isArray(body.message) ? body.message : [body.message];
}

export function apiErrorStatus(error: unknown): number | null {
  return error instanceof HttpErrorResponse ? error.status : null;
}
