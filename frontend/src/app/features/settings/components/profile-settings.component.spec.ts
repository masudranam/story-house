import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../../core/auth/auth-store';
import { ProfileSettingsComponent } from './profile-settings.component';

const session = {
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  user: {
    id: 'u1',
    name: 'Alice Rahman',
    username: 'alice',
    email: 'alice@storyhouse.local',
    role: 'USER' as const,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
};

describe('ProfileSettingsComponent', () => {
  let fixture: ComponentFixture<ProfileSettingsComponent>;
  let backend: HttpTestingController;
  let store: AuthStore;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ProfileSettingsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    // Sign in BEFORE creating the component so the form prefills from the store.
    store = TestBed.inject(AuthStore);
    backend = TestBed.inject(HttpTestingController);
    const promise = firstValueFrom(store.login('alice', 'Password123!', true));
    backend.expectOne('/api/v1/auth/login').flush(session);
    await promise;

    fixture = TestBed.createComponent(ProfileSettingsComponent);
    await fixture.whenStable();
  });

  afterEach(() => {
    backend.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const submit = (): HTMLButtonElement =>
    el().querySelector('button[type="submit"]') as HTMLButtonElement;

  it('prefills from the signed-in user and shows the read-only email', () => {
    expect((el().querySelector('#settings-name') as HTMLInputElement).value).toBe('Alice Rahman');
    expect((el().querySelector('#settings-username') as HTMLInputElement).value).toBe('alice');
    expect(el().textContent).toContain('alice@storyhouse.local');
  });

  it('keeps Save disabled until something changes', async () => {
    expect(submit().disabled).toBe(true);

    fixture.componentInstance['form'].controls.name.setValue('Alice R.');
    fixture.componentInstance['form'].markAsDirty();
    await fixture.whenStable();

    expect(submit().disabled).toBe(false);
  });

  it('saves changes and updates the store so the navbar follows', async () => {
    fixture.componentInstance['form'].setValue({ name: 'Alice R.', username: 'alice_r' });
    fixture.componentInstance['form'].markAsDirty();
    await fixture.whenStable();
    submit().click();

    const req = backend.expectOne('/api/v1/users/me');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ name: 'Alice R.', username: 'alice_r' });
    req.flush({ ...session.user, name: 'Alice R.', username: 'alice_r' });
    await fixture.whenStable();

    expect(store.user()?.username).toBe('alice_r');
  });

  it('surfaces a 409 duplicate username inline', async () => {
    fixture.componentInstance['form'].setValue({ name: 'Alice', username: 'taken' });
    fixture.componentInstance['form'].markAsDirty();
    await fixture.whenStable();
    submit().click();

    backend
      .expectOne('/api/v1/users/me')
      .flush(
        { statusCode: 409, message: 'Already exists', error: 'Conflict' },
        { status: 409, statusText: 'Conflict' },
      );
    await fixture.whenStable();

    expect(el().querySelector('[role="alert"]')?.textContent).toContain('already taken');
  });

  it('rejects an invalid username client-side', async () => {
    fixture.componentInstance['form'].controls.username.setValue('Bad Name');
    fixture.componentInstance['form'].controls.username.markAsTouched();
    await fixture.whenStable();

    expect(el().textContent).toContain('3–30 characters');
  });
});
