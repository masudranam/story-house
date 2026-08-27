/** Shared, lint-safe helpers for unit and e2e specs. */

/** First call's first argument of a jest mock, typed by the caller. */
export function firstCallArg<T>(fn: jest.Mock): T {
  const calls = fn.mock.calls as unknown[][];
  return calls[0][0] as T;
}

/** Narrow a supertest response body, typed by the caller. */
export function asBody<T>(body: unknown): T {
  return body as T;
}
