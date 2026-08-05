import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SignupPage } from './signup.page';

describe('SignupPage', () => {
  let fixture: ComponentFixture<SignupPage>;
  let backend: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(SignupPage);
    backend = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => backend.verify());

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const submitButton = (): HTMLButtonElement =>
    el().querySelector('button[type="submit"]') as HTMLButtonElement;

  function fill(overrides: Partial<Record<string, string>> = {}): void {
    fixture.componentInstance['form'].setValue({
      name: 'Alice Rahman',
      username: 'alice',
      email: 'alice@storyhouse.local',
      password: 'Password123!',
      ...overrides,
    });
  }

  it('enforces the contract username rule client-side', async () => {
    fill({ username: 'Alice Rahman' });
    fixture.componentInstance['form'].controls.username.markAsTouched();
    await fixture.whenStable();

    expect(el().textContent).toContain('3–30 characters');
    submitButton().click();
    await fixture.whenStable();
    // Invalid form → no request (afterEach verify proves it).
  });

  it('enforces the 8-character minimum password', async () => {
    fill({ password: 'short' });
    fixture.componentInstance['form'].controls.password.markAsTouched();
    await fixture.whenStable();

    expect(el().textContent).toContain('at least 8 characters');
  });

  it('rejects an invalid email', async () => {
    fill({ email: 'not-an-email' });
    fixture.componentInstance['form'].controls.email.markAsTouched();
    await fixture.whenStable();

    expect(el().textContent).toContain('valid email');
  });

  it('signs up and redirects to /login', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fill();
    await fixture.whenStable();
    submitButton().click();

    const req = backend.expectOne('/api/v1/auth/signup');
    expect(req.request.body).toEqual({
      name: 'Alice Rahman',
      username: 'alice',
      email: 'alice@storyhouse.local',
      password: 'Password123!',
    });
    req.flush({ id: 'u1' });
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('surfaces a 409 conflict inline', async () => {
    fill();
    await fixture.whenStable();
    submitButton().click();

    backend.expectOne('/api/v1/auth/signup').flush(
      {
        statusCode: 409,
        message: 'A resource with this unique value already exists',
        error: 'Conflict',
      },
      { status: 409, statusText: 'Conflict' },
    );
    await fixture.whenStable();

    expect(el().querySelector('[role="alert"]')?.textContent).toContain('already taken');
  });

  it('surfaces backend validation messages from a 400 array', async () => {
    fill();
    await fixture.whenStable();
    submitButton().click();

    backend.expectOne('/api/v1/auth/signup').flush(
      {
        statusCode: 400,
        message: ['password must be longer than or equal to 8 characters'],
        error: 'Bad Request',
      },
      { status: 400, statusText: 'Bad Request' },
    );
    await fixture.whenStable();

    expect(el().querySelector('[role="alert"]')?.textContent).toContain('8 characters');
  });
});
