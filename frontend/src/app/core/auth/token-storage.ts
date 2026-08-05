/**
 * Refresh-token persistence. "Remember me" chooses localStorage (survives the
 * browser session) vs sessionStorage. The ACCESS token is never persisted —
 * it lives only in the AuthStore signal.
 */
const KEY = 'storyhouse.refreshToken';

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
}

/** Without `remember`, rotation keeps the token in whichever storage it already uses. */
export function storeRefreshToken(token: string, remember?: boolean): void {
  const useLocal = remember ?? localStorage.getItem(KEY) !== null;
  clearRefreshToken();
  (useLocal ? localStorage : sessionStorage).setItem(KEY, token);
}

export function clearRefreshToken(): void {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}
