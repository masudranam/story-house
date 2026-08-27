import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../auth/auth-store';
import { AuthSession, Role } from '../models/api.models';
import { adminGuard } from './admin.guard';
import { authGuard } from './auth.guard';
import { guestGuard } from './guest.guard';

const route = {} as ActivatedRouteSnapshot;
const state = { url: '/settings' } as RouterStateSnapshot;

function sessionFor(role: Role): AuthSession {
  return {
    accessToken: 'access-1',
    refreshToken: 'refresh-1',
    user: {
      id: 'u1',
      name: 'Alice',
      username: 'alice',
      email: 'alice@storyhouse.local',
      role,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  };
}

describe('route guards', () => {
  let store: AuthStore;
  let backend: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    store = TestBed.inject(AuthStore);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  async function signIn(role: Role): Promise<void> {
    const promise = firstValueFrom(store.login('alice', 'Password123!', true));
    backend.expectOne('/api/v1/auth/login').flush(sessionFor(role));
    await promise;
  }

  /** Guards await store.sessionReady, so every result is a promise. */
  const run = (guard: typeof authGuard) =>
    Promise.resolve(TestBed.runInInjectionContext(() => guard(route, state)));

  it('authGuard redirects anonymous visitors to /login with a returnUrl', async () => {
    await store.init(); // no stored token → resolves sessionReady immediately
    const result = await run(authGuard);

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toContain('/login');
    expect((result as UrlTree).toString()).toContain('returnUrl');
  });

  it('authGuard admits an authenticated user', async () => {
    await store.init();
    await signIn('USER');
    await expect(run(authGuard)).resolves.toBe(true);
  });

  it('adminGuard blocks a regular user and admits an admin', async () => {
    await store.init();
    await signIn('USER');
    const blocked = await run(adminGuard);
    expect(blocked).toBeInstanceOf(UrlTree);
    expect((blocked as UrlTree).toString()).toBe('/');

    store.setUser({ ...sessionFor('ADMIN').user });
    await expect(run(adminGuard)).resolves.toBe(true);
  });

  it('guestGuard admits anonymous visitors and bounces signed-in users home', async () => {
    await store.init();
    await expect(run(guestGuard)).resolves.toBe(true);

    await signIn('USER');
    const bounced = await run(guestGuard);
    expect(bounced).toBeInstanceOf(UrlTree);
    expect((bounced as UrlTree).toString()).toBe('/');
  });

  it('authGuard waits for a persisted session to restore before deciding', async () => {
    localStorage.setItem('storyhouse.refreshToken', 'refresh-1');
    void store.init();

    // Guard is asked while the restore is still in flight.
    const decision = run(authGuard);

    backend
      .expectOne('/api/v1/auth/refresh')
      .flush({ accessToken: 'access-2', refreshToken: 'refresh-2' });
    await Promise.resolve();
    backend.expectOne('/api/v1/users/me').flush(sessionFor('USER').user);

    // It admits the restored user instead of bouncing to /login.
    await expect(decision).resolves.toBe(true);
  });
});
