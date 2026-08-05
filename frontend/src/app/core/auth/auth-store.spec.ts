import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from './auth-store';
import { AuthSession, TokenPair, User } from '../models/api.models';

const user: User = {
  id: 'u1',
  name: 'Alice Rahman',
  username: 'alice',
  email: 'alice@storyhouse.local',
  role: 'USER',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const session: AuthSession = { accessToken: 'access-1', refreshToken: 'refresh-1', user };
const rotated: TokenPair = { accessToken: 'access-2', refreshToken: 'refresh-2' };

const STORAGE_KEY = 'storyhouse.refreshToken';

describe('AuthStore', () => {
  let store: AuthStore;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    store = TestBed.inject(AuthStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('starts anonymous', () => {
    expect(store.isAuthenticated()).toBe(false);
    expect(store.isAdmin()).toBe(false);
    expect(store.accessToken()).toBeNull();
  });

  it('login with rememberMe persists the refresh token in localStorage only', async () => {
    const promise = firstValueFrom(store.login('alice', 'Password123!', true));
    http.expectOne('/api/v1/auth/login').flush(session);
    await promise;

    expect(localStorage.getItem(STORAGE_KEY)).toBe('refresh-1');
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(store.isAuthenticated()).toBe(true);
    expect(store.accessToken()).toBe('access-1');
    // The access token must never be persisted.
    expect(JSON.stringify({ ...localStorage })).not.toContain('access-1');
  });

  it('login without rememberMe uses sessionStorage', async () => {
    const promise = firstValueFrom(store.login('alice', 'Password123!', false));
    http.expectOne('/api/v1/auth/login').flush(session);
    await promise;

    expect(sessionStorage.getItem(STORAGE_KEY)).toBe('refresh-1');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('isAdmin reflects the ADMIN role', async () => {
    const promise = firstValueFrom(store.login('admin', 'Password123!', true));
    http.expectOne('/api/v1/auth/login').flush({ ...session, user: { ...user, role: 'ADMIN' } });
    await promise;

    expect(store.isAdmin()).toBe(true);
  });

  it('refresh is single-flight: two concurrent callers share ONE http request', async () => {
    localStorage.setItem(STORAGE_KEY, 'refresh-1');

    const first = firstValueFrom(store.refresh());
    const second = firstValueFrom(store.refresh());

    // Exactly one request — expectOne throws if the store fired two.
    http.expectOne('/api/v1/auth/refresh').flush(rotated);

    await expect(first).resolves.toBe('access-2');
    await expect(second).resolves.toBe('access-2');
    expect(store.accessToken()).toBe('access-2');
    // Rotation replaces the stored token, keeping the original storage choice.
    expect(localStorage.getItem(STORAGE_KEY)).toBe('refresh-2');
  });

  it('refresh allows a new request after the previous one settled', async () => {
    localStorage.setItem(STORAGE_KEY, 'refresh-1');

    const first = firstValueFrom(store.refresh());
    http.expectOne('/api/v1/auth/refresh').flush(rotated);
    await first;

    const second = firstValueFrom(store.refresh());
    http.expectOne('/api/v1/auth/refresh').flush({
      accessToken: 'access-3',
      refreshToken: 'refresh-3',
    });
    await expect(second).resolves.toBe('access-3');
  });

  it('refresh errors when nothing is stored, without touching the network', async () => {
    await expect(firstValueFrom(store.refresh())).rejects.toThrow(/no refresh token/i);
  });

  it('logout revokes server-side then clears every trace of the session', async () => {
    const promise = firstValueFrom(store.login('alice', 'Password123!', true));
    http.expectOne('/api/v1/auth/login').flush(session);
    await promise;

    store.logout();
    const revoke = http.expectOne('/api/v1/auth/logout');
    expect(revoke.request.body).toEqual({ refreshToken: 'refresh-1' });
    revoke.flush(null);

    expect(store.isAuthenticated()).toBe(false);
    expect(store.accessToken()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('init() restores a session from a stored refresh token', async () => {
    localStorage.setItem(STORAGE_KEY, 'refresh-1');

    const promise = store.init();
    http.expectOne('/api/v1/auth/refresh').flush(rotated);
    // init() awaits the refresh before calling /users/me — let that microtask run.
    await Promise.resolve();
    http.expectOne('/api/v1/users/me').flush(user);
    await promise;

    expect(store.isAuthenticated()).toBe(true);
    expect(store.user()?.username).toBe('alice');
  });

  it('init() clears a stale refresh token instead of throwing', async () => {
    localStorage.setItem(STORAGE_KEY, 'stale');

    const promise = store.init();
    http.expectOne('/api/v1/auth/refresh').flush(
      { statusCode: 401, message: 'Invalid refresh token', error: 'Unauthorized' },
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );
    await promise;

    // A failed refresh must not attempt /users/me at all.
    http.expectNone('/api/v1/users/me');
    expect(store.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('init() is a no-op with no stored token', async () => {
    await store.init();
    expect(store.isAuthenticated()).toBe(false);
  });
});
