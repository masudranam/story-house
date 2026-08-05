import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../auth/auth-store';
import { authInterceptor } from './auth.interceptor';
import { refreshInterceptor } from './refresh.interceptor';
import { AuthSession } from '../models/api.models';

const STORAGE_KEY = 'storyhouse.refreshToken';

const session: AuthSession = {
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  user: {
    id: 'u1',
    name: 'Alice',
    username: 'alice',
    email: 'alice@storyhouse.local',
    role: 'USER',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
};

describe('refreshInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let store: AuthStore;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor, refreshInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    store = TestBed.inject(AuthStore);

    // Establish an authenticated session for every test.
    const login = firstValueFrom(store.login('alice', 'Password123!', true));
    backend.expectOne('/api/v1/auth/login').flush(session);
    await login;
  });

  afterEach(() => {
    backend.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  const unauthorized = { status: 401, statusText: 'Unauthorized' };

  it('refreshes once on 401 and retries the request with the new token', async () => {
    const result = firstValueFrom(http.get('/api/v1/users/me'));

    const first = backend.expectOne('/api/v1/users/me');
    expect(first.request.headers.get('Authorization')).toBe('Bearer access-1');
    first.flush({ statusCode: 401, message: 'Unauthorized', error: 'Unauthorized' }, unauthorized);

    backend
      .expectOne('/api/v1/auth/refresh')
      .flush({ accessToken: 'access-2', refreshToken: 'refresh-2' });

    const retry = backend.expectOne('/api/v1/users/me');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer access-2');
    retry.flush({ id: 'u1' });

    await expect(result).resolves.toEqual({ id: 'u1' });
  });

  it('logs out and redirects to /login when the refresh itself fails', async () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const result = firstValueFrom(http.get('/api/v1/users/me'));
    backend
      .expectOne('/api/v1/users/me')
      .flush({ statusCode: 401, message: 'Unauthorized', error: 'Unauthorized' }, unauthorized);
    backend
      .expectOne('/api/v1/auth/refresh')
      .flush(
        { statusCode: 401, message: 'Invalid refresh token', error: 'Unauthorized' },
        unauthorized,
      );

    await expect(result).rejects.toBeTruthy();
    expect(store.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login'], expect.objectContaining({}));
  });

  it('does not attempt a refresh for a 401 from /auth/refresh itself (no loop)', async () => {
    localStorage.setItem(STORAGE_KEY, 'refresh-1');
    const result = firstValueFrom(store.refresh());

    backend
      .expectOne('/api/v1/auth/refresh')
      .flush(
        { statusCode: 401, message: 'Invalid refresh token', error: 'Unauthorized' },
        unauthorized,
      );

    await expect(result).rejects.toBeTruthy();
    // No second refresh call was made — verify() in afterEach enforces it.
  });

  it('leaves non-401 errors alone (a 500 must NOT trigger a refresh — legacy bug)', async () => {
    const result = firstValueFrom(http.get('/api/v1/stories'));
    backend.expectOne('/api/v1/stories').flush(
      { statusCode: 500, message: 'Internal server error', error: 'Internal Server Error' },
      {
        status: 500,
        statusText: 'Internal Server Error',
      },
    );

    await expect(result).rejects.toBeTruthy();
    expect(store.isAuthenticated()).toBe(true);
  });

  it('retries only ONCE: a second 401 after refresh propagates the error', async () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const result = firstValueFrom(http.get('/api/v1/users/me'));
    backend
      .expectOne('/api/v1/users/me')
      .flush({ statusCode: 401, message: 'Unauthorized', error: 'Unauthorized' }, unauthorized);
    backend
      .expectOne('/api/v1/auth/refresh')
      .flush({ accessToken: 'access-2', refreshToken: 'refresh-2' });
    backend
      .expectOne('/api/v1/users/me')
      .flush({ statusCode: 401, message: 'Unauthorized', error: 'Unauthorized' }, unauthorized);

    await expect(result).rejects.toBeTruthy();
    expect(store.isAuthenticated()).toBe(false);
  });
});
