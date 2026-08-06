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
  template: `
    <div class="flex flex-col gap-6">
      <app-card>
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4" novalidate>
          <h2 class="text-lg font-semibold">Change password</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Changing your password signs out your other sessions.
          </p>

          @if (formError()) {
            <p
              class="rounded-lg bg-danger-600/10 px-3 py-2 text-sm text-danger-700 dark:text-danger-500"
              role="alert"
            >
              {{ formError() }}
            </p>
          }

          <app-form-field
            label="Current password"
            for="current-password"
            [error]="error('currentPassword')"
          >
            <div class="relative">
              <input
                id="current-password"
                [type]="showCurrent() ? 'text' : 'password'"
                formControlName="currentPassword"
                autocomplete="current-password"
                class="pr-20"
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-brand-600 dark:text-brand-300"
                [attr.aria-pressed]="showCurrent()"
                aria-label="Toggle current password visibility"
                (click)="showCurrent.set(!showCurrent())"
              >
                {{ showCurrent() ? 'Hide' : 'Show' }}
              </button>
            </div>
          </app-form-field>

          <app-form-field
            label="New password"
            for="new-password"
            [error]="error('newPassword')"
            hint="At least 8 characters"
          >
            <div class="relative">
              <input
                id="new-password"
                [type]="showNew() ? 'text' : 'password'"
                formControlName="newPassword"
                autocomplete="new-password"
                class="pr-20"
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-brand-600 dark:text-brand-300"
                [attr.aria-pressed]="showNew()"
                aria-label="Toggle new password visibility"
                (click)="showNew.set(!showNew())"
              >
                {{ showNew() ? 'Hide' : 'Show' }}
              </button>
            </div>
          </app-form-field>

          <div class="flex justify-end">
            <app-button type="submit" [loading]="saving()">Update password</app-button>
          </div>
        </form>
      </app-card>

      <app-card>
        <h2 class="text-lg font-semibold text-danger-600">Danger zone</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Deleting your account permanently removes your stories, comments and likes.
        </p>
        @if (isAdmin()) {
          <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Admin accounts can't be self-deleted.
          </p>
        } @else {
          <div class="mt-4">
            <app-button variant="danger" (clicked)="askDelete()">Delete my account</app-button>
          </div>
        }
      </app-card>
    </div>

    @if (confirmingDelete()) {
      <app-confirm-dialog
        title="Delete your account?"
        message="This cannot be undone. Your stories, comments and likes will be removed."
        confirmLabel="Delete account"
        [loading]="deleting()"
        (confirmed)="deleteAccount()"
        (cancelled)="cancelDelete()"
      />
    }
  `,
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
      next: () => {
        this.saving.set(false);
        this.form.reset();
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
