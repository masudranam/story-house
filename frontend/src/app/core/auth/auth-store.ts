import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, firstValueFrom, map, Observable, shareReplay, tap, throwError } from 'rxjs';
import { AuthApi } from '../api/auth.api';
import { UsersApi } from '../api/users.api';
import { AuthSession, User } from '../models/api.models';
import { clearRefreshToken, getStoredRefreshToken, storeRefreshToken } from './token-storage';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authApi = inject(AuthApi);
  private readonly usersApi = inject(UsersApi);
  private readonly router = inject(Router);

  private readonly _user = signal<User | null>(null);
  private readonly _accessToken = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');

  private refreshInFlight$: Observable<string> | null = null;

  /**
   * Resolves once a persisted session has been restored (or proven dead).
   * Guards await this instead of the app blocking on a blank page during
   * bootstrap — the shell renders immediately.
   */
  readonly sessionReady: Promise<void>;
  private resolveSessionReady!: () => void;

  constructor() {
    this.sessionReady = new Promise<void>((resolve) => {
      this.resolveSessionReady = resolve;
    });
  }

  /**
   * Kicked off (not awaited) at bootstrap. Everything is inside the try —
   * including the storage read, which throws when storage is blocked
   * (private mode, blocked cookies). sessionReady must always settle or
   * every guarded route would hang forever.
   */
  async init(): Promise<void> {
    try {
      if (!getStoredRefreshToken()) {
        return;
      }
      await firstValueFrom(this.refresh());
      this._user.set(await firstValueFrom(this.usersApi.me()));
    } catch {
      // Stored token is stale/revoked, or storage is unavailable — anonymous.
      this.clearSession();
    } finally {
      this.resolveSessionReady();
    }
  }

  login(identifier: string, password: string, rememberMe: boolean): Observable<AuthSession> {
    return this.authApi.login(identifier, password).pipe(
      tap((session) => {
        storeRefreshToken(session.refreshToken, rememberMe);
        this._accessToken.set(session.accessToken);
        this._user.set(session.user);
      }),
    );
  }

  /**
   * Rotates the refresh token and returns the new access token.
   * Single-flight: concurrent callers share one HTTP request.
   */
  refresh(): Observable<string> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }
    const stored = getStoredRefreshToken();
    if (!stored) {
      return throwError(() => new Error('No refresh token available'));
    }
    this.refreshInFlight$ = this.authApi.refresh(stored).pipe(
      tap((pair) => {
        storeRefreshToken(pair.refreshToken);
        this._accessToken.set(pair.accessToken);
      }),
      map((pair) => pair.accessToken),
      finalize(() => {
        this.refreshInFlight$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.refreshInFlight$;
  }

  /** Revokes the refresh token server-side (fire-and-forget) and clears local state. */
  logout(): void {
    const stored = getStoredRefreshToken();
    if (stored) {
      this.authApi.logout(stored).subscribe({ error: () => undefined });
    }
    this.clearSession();
    void this.router.navigateByUrl('/');
  }

  /** Local teardown only — used when a refresh fails (session already dead server-side). */
  clearSession(): void {
    clearRefreshToken();
    this._accessToken.set(null);
    this._user.set(null);
  }

  /** Keeps the store in sync after profile edits. */
  setUser(user: User): void {
    this._user.set(user);
  }
}
