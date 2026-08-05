import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApi } from '../../../core/api/auth.api';
import { apiErrorMessage, apiErrorMessages, apiErrorStatus } from '../../../core/api/api-error';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Mirrors the backend rules exactly (contract Auth section). */
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

@Component({
  selector: 'app-signup-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, CardComponent, FormFieldComponent],
  templateUrl: './signup.page.html',
})
export class SignupPage {
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    username: ['', [Validators.required, Validators.pattern(USERNAME_PATTERN)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected error(control: 'name' | 'username' | 'email' | 'password'): string | null {
    const field: AbstractControl = this.form.controls[control];
    if (!field.touched || field.valid) {
      return null;
    }
    switch (control) {
      case 'name':
        return field.hasError('required') ? 'Your name is required' : 'Name is too long';
      case 'username':
        return field.hasError('required')
          ? 'Pick a username'
          : '3–30 characters: lowercase letters, numbers, or underscore';
      case 'email':
        return field.hasError('required') ? 'Email is required' : 'Enter a valid email address';
      case 'password':
        return field.hasError('required') ? 'Choose a password' : 'Use at least 8 characters';
    }
  }

  protected togglePassword(): void {
    this.showPassword.update((shown) => !shown);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue();
    this.submitting.set(true);
    this.formError.set(null);

    this.authApi.signup({ ...payload, name: payload.name.trim() }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success('Account created — please log in.');
        void this.router.navigateByUrl('/login');
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        if (apiErrorStatus(error) === 409) {
          this.formError.set('That username or email is already taken.');
          return;
        }
        const messages = apiErrorMessages(error);
        this.formError.set(
          messages.length > 0
            ? messages.join(' ')
            : apiErrorMessage(error, 'Could not create your account. Please try again.'),
        );
      },
    });
  }
}
