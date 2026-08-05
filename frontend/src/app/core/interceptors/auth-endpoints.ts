/** Endpoints that must never carry a bearer token or trigger a refresh-retry. */
const PUBLIC_AUTH_ENDPOINTS = ['/api/v1/auth/login', '/api/v1/auth/signup', '/api/v1/auth/refresh'];

export function isPublicAuthEndpoint(url: string): boolean {
  return PUBLIC_AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}
