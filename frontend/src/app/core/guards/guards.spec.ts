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

  it('authGuard redirects anonymous visitors to /login with a returnUrl', () => {
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toContain('/login');
    expect((result as UrlTree).toString()).toContain('returnUrl');
  });

  it('authGuard admits an authenticated user', async () => {
    await signIn('USER');
    expect(TestBed.runInInjectionContext(() => authGuard(route, state))).toBe(true);
  });

  it('adminGuard blocks a regular user and admits an admin', async () => {
    await signIn('USER');
    const blocked = TestBed.runInInjectionContext(() => adminGuard(route, state));
    expect(blocked).toBeInstanceOf(UrlTree);
    expect((blocked as UrlTree).toString()).toBe('/');

    store.setUser({ ...sessionFor('ADMIN').user });
    expect(TestBed.runInInjectionContext(() => adminGuard(route, state))).toBe(true);
  });

  it('guestGuard admits anonymous visitors and bounces signed-in users home', async () => {
    expect(TestBed.runInInjectionContext(() => guestGuard(route, state))).toBe(true);

    await signIn('USER');
    const bounced = TestBed.runInInjectionContext(() => guestGuard(route, state));
    expect(bounced).toBeInstanceOf(UrlTree);
    expect((bounced as UrlTree).toString()).toBe('/');
  });
});
