/**
 * Refresh-token persistence. "Remember me" chooses localStorage (survives the
 * browser session) vs sessionStorage. The ACCESS token is never persisted —
 * it lives only in the AuthStore signal.
 *
 * Every access is guarded: storage throws in private mode / with cookies
 * blocked, and a session restore must degrade to "anonymous", never crash.
 */
const KEY = 'storyhouse.refreshToken';

export function getStoredRefreshToken(): string | null {
  try {
    return localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Without `remember`, rotation keeps the token in whichever storage it already uses. */
export function storeRefreshToken(token: string, remember?: boolean): void {
  try {
    const useLocal = remember ?? localStorage.getItem(KEY) !== null;
    clearRefreshToken();
    (useLocal ? localStorage : sessionStorage).setItem(KEY, token);
  } catch {
    // Unavailable storage means the session simply won't survive a reload.
  }
}

export function clearRefreshToken(): void {
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
