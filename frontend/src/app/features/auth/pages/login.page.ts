import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { apiErrorMessage, apiErrorStatus } from '../../../core/api/api-error';
import { AuthStore } from '../../../core/auth/auth-store';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, CardComponent, FormFieldComponent],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  /**
   * returnUrl comes from the URL, so it is attacker-controllable: only accept
   * same-site absolute paths ("//evil.com" is protocol-relative, not a path).
   */
  private safeReturnUrl(): string {
    const candidate = this.route.snapshot.queryParamMap.get('returnUrl');
    if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) {
      return '/';
    }
    return candidate;
  }

  protected error(control: 'identifier' | 'password'): string | null {
    const field = this.form.controls[control];
    if (!field.touched || field.valid) {
      return null;
    }
    return control === 'identifier' ? 'Enter your username or email' : 'Enter your password';
  }

  protected togglePassword(): void {
    this.showPassword.update((shown) => !shown);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { identifier, password, rememberMe } = this.form.getRawValue();
    this.submitting.set(true);
    this.formError.set(null);

    this.store.login(identifier.trim(), password, rememberMe).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success('Welcome back!');
        void this.router.navigateByUrl(this.safeReturnUrl());
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        // 401 is expected here — show it in the form, not as a toast.
        this.formError.set(
          apiErrorStatus(error) === 401
            ? 'Incorrect username/email or password.'
            : apiErrorMessage(error, 'Could not log in. Please try again.'),
        );
      },
    });
  }
}
