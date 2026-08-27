import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../../core/auth/auth-store';
import { Page, User } from '../../../core/models/api.models';
import { AdminUsersPage } from './admin-users.page';

const admin: User = {
  id: 'admin-1',
  name: 'Root Admin',
  username: 'root',
  email: 'root@storyhouse.local',
  role: 'ADMIN',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const regular: User = { ...admin, id: 'u2', name: 'Alice', username: 'alice', role: 'USER' };

const page: Page<User> = {
  data: [admin, regular],
  meta: { page: 1, limit: 10, totalItems: 2, totalPages: 1 },
};

describe('AdminUsersPage', () => {
  let fixture: ComponentFixture<AdminUsersPage>;
  let backend: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AdminUsersPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    backend = TestBed.inject(HttpTestingController);

    // Sign in as the admin whose row must not offer self-deletion.
    const store = TestBed.inject(AuthStore);
    const login = firstValueFrom(store.login('root', 'Password123!', true));
    backend.expectOne('/api/v1/auth/login').flush({
      accessToken: 'a',
      refreshToken: 'r',
      user: admin,
    });
    await login;

    fixture = TestBed.createComponent(AdminUsersPage);
    fixture.detectChanges();
    flushUsers(page);
    await fixture.whenStable();
  });

  afterEach(() => {
    // Any list request still open is a resource reload we deliberately don't
    // assert on; flush it so verify() only fails on genuinely unexpected calls.
    flushUsers(page);
    backend.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  /** Flush every currently pending GET /users (the resource can refire on param settling). */
  function flushUsers(body: Page<User>): number {
    const requests = backend.match((req) => req.url === '/api/v1/users');
    requests.forEach((req) => req.flush(body));
    return requests.length;
  }

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;

  it('lists users with role badges and emails', () => {
    expect(el().textContent).toContain('root');
    expect(el().textContent).toContain('alice');
    expect(el().textContent).toContain('ADMIN');
    expect(el().textContent).toContain('root@storyhouse.local');
  });

  it('marks the signed-in admin as "You" and offers no delete for that row', () => {
    const rows = Array.from(el().querySelectorAll('tbody tr'));
    const ownRow = rows.find((row) => row.textContent?.includes('root'));
    const otherRow = rows.find((row) => row.textContent?.includes('alice'));

    expect(ownRow?.textContent).toContain('You');
    expect(ownRow?.querySelector('button')).toBeNull();
    expect(otherRow?.querySelector('button')?.textContent).toContain('Delete');
  });

  it('deletes another user behind a confirm dialog and reloads the list', async () => {
    const deleteButton = Array.from(el().querySelectorAll('tbody button')).find((b) =>
      b.textContent?.includes('Delete'),
    ) as HTMLButtonElement;
    deleteButton.click();
    await fixture.whenStable();

    const dialog = el().querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('alice');

    const confirm = Array.from(
      el().querySelectorAll<HTMLButtonElement>('[role="dialog"] button'),
    ).find((b) => b.textContent?.includes('Delete user'));
    confirm?.click();

    backend.expectOne({ method: 'DELETE', url: '/api/v1/users/u2' }).flush(null);
    fixture.detectChanges();

    // The list reloads after a successful delete.
    const reloads = flushUsers({
      data: [admin],
      meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
    });
    expect(reloads).toBeGreaterThan(0);
    await fixture.whenStable();
    expect(el().textContent).not.toContain('alice');
  });

  it('sends the role filter to the API', async () => {
    fixture.componentInstance['setRole']('ADMIN');
    fixture.detectChanges();

    const filtered = backend.match(
      (r) => r.url === '/api/v1/users' && r.params.get('role') === 'ADMIN',
    );
    expect(filtered.length).toBe(1);
    filtered[0].flush({
      data: [admin],
      meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
    });
    await fixture.whenStable();
  });

  it('has an accessible table with a caption and column headers', () => {
    expect(el().querySelector('caption')).not.toBeNull();
    const headers = Array.from(el().querySelectorAll('th')).map((h) => h.getAttribute('scope'));
    expect(headers.every((scope) => scope === 'col')).toBe(true);
  });
});
