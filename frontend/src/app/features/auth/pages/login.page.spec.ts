import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth-store';
import { LoginPage } from './login.page';

const session = {
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

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let backend: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginPage);
    backend = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    backend.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const submitButton = (): HTMLButtonElement =>
    el().querySelector('button[type="submit"]') as HTMLButtonElement;

  function fill(identifier: string, password: string, remember = false): void {
    const form = fixture.componentInstance['form'];
    form.setValue({ identifier, password, rememberMe: remember });
  }

  it('renders labelled inputs wired to real ids (legacy labels pointed nowhere)', () => {
    const identifier = el().querySelector('#identifier');
    const label = el().querySelector('label[for="identifier"]');
    expect(identifier).not.toBeNull();
    expect(label?.textContent).toContain('Username or email');
  });

  it('does not submit an empty form and shows field errors once touched', async () => {
    submitButton().click();
    await fixture.whenStable();

    expect(el().textContent).toContain('Enter your username or email');
    expect(el().textContent).toContain('Enter your password');
    // No HTTP call was attempted — verify() in afterEach proves it.
  });

  it('logs in, stores the session, and honours rememberMe', async () => {
    fill('alice', 'Password123!', true);
    await fixture.whenStable();
    submitButton().click();

    const req = backend.expectOne('/api/v1/auth/login');
    expect(req.request.body).toEqual({ identifier: 'alice', password: 'Password123!' });
    req.flush(session);
    await fixture.whenStable();

    expect(TestBed.inject(AuthStore).isAuthenticated()).toBe(true);
    expect(localStorage.getItem('storyhouse.refreshToken')).toBe('refresh-1');
  });

  it('shows a 401 inline rather than as a toast, and stays on the page', async () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fill('alice', 'WrongPass123!');
    await fixture.whenStable();
    submitButton().click();

    backend
      .expectOne('/api/v1/auth/login')
      .flush(
        { statusCode: 401, message: 'Invalid credentials', error: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' },
      );
    await fixture.whenStable();

    expect(el().querySelector('[role="alert"]')?.textContent).toContain('Incorrect username/email');
    expect(navigate).not.toHaveBeenCalled();
    expect(submitButton().disabled).toBe(false);
  });

  it('toggles password visibility', async () => {
    const toggle = Array.from(el().querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Show',
    );
    const input = () => el().querySelector('#password') as HTMLInputElement;
    expect(input().type).toBe('password');

    toggle?.click();
    await fixture.whenStable();

    expect(input().type).toBe('text');
  });
});
