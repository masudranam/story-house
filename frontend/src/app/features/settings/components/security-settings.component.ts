import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { apiErrorMessage, apiErrorStatus } from '../../../core/api/api-error';
import { UsersApi } from '../../../core/api/users.api';
import { AuthStore } from '../../../core/auth/auth-store';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-security-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    ConfirmDialogComponent,
    FormFieldComponent,
  ],
  templateUrl: './security-settings.component.html',
})
export class SecuritySettingsComponent {
  private readonly usersApi = inject(UsersApi);
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly isAdmin = this.store.isAdmin;
  protected readonly saving = signal(false);
  protected readonly deleting = signal(false);
  protected readonly confirmingDelete = signal(false);
  protected readonly formError = signal<string | null>(null);
  // Visibility toggles — parity with the legacy security page.
  protected readonly showCurrent = signal(false);
  protected readonly showNew = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected error(control: 'currentPassword' | 'newPassword'): string | null {
    const field = this.form.controls[control];
    if (!field.touched || field.valid) {
      return null;
    }
    if (control === 'currentPassword') {
      return 'Enter your current password';
    }
    return field.hasError('required') ? 'Choose a new password' : 'Use at least 8 characters';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword } = this.form.getRawValue();
    this.saving.set(true);
    this.formError.set(null);

    this.usersApi.changePassword(currentPassword, newPassword).subscribe({
      next: (tokens) => {
        this.saving.set(false);
        this.form.reset();
        // The change invalidated the credentials we were using; adopt the
        // replacements so this session keeps working.
        this.store.applyTokens(tokens);
        this.toast.success('Password updated. Other sessions were signed out.');
      },
      error: (error: unknown) => {
        this.saving.set(false);
        const status = apiErrorStatus(error);
        if (status === 401) {
          this.formError.set('Your current password is incorrect.');
        } else if (status === 400) {
          this.formError.set('Your new password must be different and at least 8 characters.');
        } else {
          this.formError.set(apiErrorMessage(error, 'Could not update your password.'));
        }
      },
    });
  }

  protected askDelete(): void {
    this.confirmingDelete.set(true);
  }

  protected cancelDelete(): void {
    this.confirmingDelete.set(false);
  }

  protected deleteAccount(): void {
    this.deleting.set(true);
    this.usersApi.deleteMe().subscribe({
      next: () => {
        this.deleting.set(false);
        this.confirmingDelete.set(false);
        this.store.clearSession();
        this.toast.success('Your account was deleted.');
        void this.router.navigateByUrl('/');
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.confirmingDelete.set(false);
        this.toast.error(apiErrorMessage(error, 'Could not delete your account.'));
      },
    });
  }
}
