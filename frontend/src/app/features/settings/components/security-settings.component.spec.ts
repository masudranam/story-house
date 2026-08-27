import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../../core/auth/auth-store';
import { Role } from '../../../core/models/api.models';
import { SecuritySettingsComponent } from './security-settings.component';

function sessionFor(role: Role) {
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

describe('SecuritySettingsComponent', () => {
  let fixture: ComponentFixture<SecuritySettingsComponent>;
  let backend: HttpTestingController;
  let store: AuthStore;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SecuritySettingsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(SecuritySettingsComponent);
    backend = TestBed.inject(HttpTestingController);
    store = TestBed.inject(AuthStore);
    await fixture.whenStable();
  });

  afterEach(() => {
    backend.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const submit = (): HTMLButtonElement =>
    el().querySelector('form button[type="submit"]') as HTMLButtonElement;

  async function signIn(role: Role = 'USER'): Promise<void> {
    const promise = firstValueFrom(store.login('alice', 'Password123!', true));
    backend.expectOne('/api/v1/auth/login').flush(sessionFor(role));
    await promise;
    await fixture.whenStable();
  }

  function fillPasswords(current: string, next: string): void {
    fixture.componentInstance['form'].setValue({
      currentPassword: current,
      newPassword: next,
    });
  }

  it('warns that changing the password signs out other sessions', () => {
    expect(el().textContent).toContain('signs out your other sessions');
  });

  it('blocks submission of a short new password', async () => {
    fillPasswords('OldPassword123!', 'short');
    fixture.componentInstance['form'].controls.newPassword.markAsTouched();
    await fixture.whenStable();

    expect(el().textContent).toContain('at least 8 characters');
    submit().click();
    await fixture.whenStable();
    // No request — afterEach verify() enforces it.
  });

  it('sends the change and adopts the replacement tokens so the session survives', async () => {
    await signIn();
    fillPasswords('OldPassword123!', 'NewPassword456!');
    await fixture.whenStable();
    submit().click();

    const req = backend.expectOne('/api/v1/users/me/password');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword456!',
    });
    // The API returns a fresh pair because the change invalidated the old one.
    req.flush({ accessToken: 'access-2', refreshToken: 'refresh-2' });
    await fixture.whenStable();

    expect(el().querySelector('[role="alert"]')).toBeNull();
    expect(store.isAuthenticated()).toBe(true);
    expect(store.accessToken()).toBe('access-2');
    expect(localStorage.getItem('storyhouse.refreshToken')).toBe('refresh-2');
  });

  it('maps a 401 to a wrong-current-password message', async () => {
    fillPasswords('WrongPass123!', 'NewPassword456!');
    await fixture.whenStable();
    submit().click();

    backend
      .expectOne('/api/v1/users/me/password')
      .flush(
        { statusCode: 401, message: 'Current password is incorrect', error: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' },
      );
    await fixture.whenStable();

    expect(el().querySelector('[role="alert"]')?.textContent).toContain(
      'current password is incorrect',
    );
  });

  it('maps a 400 (same-as-current) to a helpful message', async () => {
    fillPasswords('Password123!', 'Password123!');
    await fixture.whenStable();
    submit().click();

    backend.expectOne('/api/v1/users/me/password').flush(
      {
        statusCode: 400,
        message: 'New password must differ from the current one',
        error: 'Bad Request',
      },
      { status: 400, statusText: 'Bad Request' },
    );
    await fixture.whenStable();

    expect(el().querySelector('[role="alert"]')?.textContent).toContain('must be different');
  });

  it('offers account deletion to a regular user behind a confirm dialog', async () => {
    await signIn('USER');
    const deleteButton = Array.from(el().querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Delete my account'),
    );
    expect(deleteButton).toBeDefined();

    deleteButton?.click();
    await fixture.whenStable();
    expect(el().querySelector('[role="dialog"]')).not.toBeNull();

    const confirm = Array.from(
      el().querySelectorAll<HTMLButtonElement>('[role="dialog"] button'),
    ).find((b) => b.textContent?.includes('Delete account'));
    confirm?.click();

    backend.expectOne({ method: 'DELETE', url: '/api/v1/users/me' }).flush(null);
    await fixture.whenStable();

    expect(store.isAuthenticated()).toBe(false);
  });

  it('hides self-deletion from admins (the backend forbids it)', async () => {
    await signIn('ADMIN');

    expect(el().textContent).toContain("Admin accounts can't be self-deleted");
    const deleteButton = Array.from(el().querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Delete my account'),
    );
    expect(deleteButton).toBeUndefined();
  });
});
