import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../core/auth/auth-store';
import { Role } from '../../core/models/api.models';
import { NavbarComponent } from './navbar.component';

function sessionFor(role: Role) {
  return {
    accessToken: 'access-1',
    refreshToken: 'refresh-1',
    user: {
      id: 'u1',
      name: 'Alice Rahman',
      username: 'alice',
      email: 'alice@storyhouse.local',
      role,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  };
}

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let backend: HttpTestingController;
  let store: AuthStore;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // Real routes so navigation (and therefore currentUrl) actually works.
        provideRouter([
          { path: '', children: [] },
          { path: 'login', children: [] },
        ]),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(NavbarComponent);
    backend = TestBed.inject(HttpTestingController);
    store = TestBed.inject(AuthStore);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.useRealTimers();
    backend.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const searchBox = () => el().querySelector('#global-search') as HTMLInputElement;

  function type(value: string): void {
    const input = searchBox();
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function signIn(role: Role = 'USER'): Promise<void> {
    const promise = firstValueFrom(store.login('alice', 'Password123!', true));
    backend.expectOne('/api/v1/auth/login').flush(sessionFor(role));
    await promise;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('shows log in / sign up while anonymous', () => {
    expect(el().textContent).toContain('Log in');
    expect(el().textContent).toContain('Sign up');
  });

  it('shows the avatar menu when signed in, with Admin only for admins', async () => {
    await signIn('USER');
    (el().querySelector('button[aria-haspopup="menu"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(el().querySelector('[role="menu"]')?.textContent).toContain('Profile');
    expect(el().querySelector('[role="menu"]')?.textContent).not.toContain('Admin');

    store.setUser(sessionFor('ADMIN').user);
    fixture.detectChanges();
    expect(el().querySelector('[role="menu"]')?.textContent).toContain('Admin');
  });

  it('Escape closes the account menu', async () => {
    await signIn();
    (el().querySelector('button[aria-haspopup="menu"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el().querySelector('[role="menu"]')).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(el().querySelector('[role="menu"]')).toBeNull();
  });

  it('does NOT restore a stale term over what the user is typing', () => {
    // Regression: the URL→box sync effect used to depend on the signal it
    // wrote, so every keystroke re-ran it and pushed the old ?q= back.
    type('dragons');
    fixture.detectChanges();
    expect(searchBox().value).toBe('dragons');

    type('');
    fixture.detectChanges();

    // The box stays empty instead of the previous term reappearing.
    expect(searchBox().value).toBe('');
  });

  it('debounces the search before navigating', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    type('light');
    fixture.detectChanges();
    expect(navigate).not.toHaveBeenCalled();

    vi.advanceTimersByTime(400);
    fixture.detectChanges();

    expect(navigate).toHaveBeenCalledWith(['/'], expect.objectContaining({}));
  });

  it('hides the search box on the login route', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/login');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(el().querySelector('#global-search')).toBeNull();
  });
});
