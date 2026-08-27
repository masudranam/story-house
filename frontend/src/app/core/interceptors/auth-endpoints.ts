/** Endpoints that must never carry a bearer token or trigger a refresh-retry. */
const PUBLIC_AUTH_PATHS = ['/api/v1/auth/login', '/api/v1/auth/signup', '/api/v1/auth/refresh'];

/**
 * Compares the PATHNAME, not the whole URL — a substring check would match a
 * query value like `?search=/api/v1/auth/login` and silently strip the token.
 */
export function isPublicAuthEndpoint(url: string): boolean {
  let pathname: string;
  try {
    pathname = new URL(url, 'http://localhost').pathname;
  } catch {
    return false;
  }
  return PUBLIC_AUTH_PATHS.includes(pathname);
}
