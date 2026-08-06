import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { apiErrorMessage, apiErrorStatus } from '../../../core/api/api-error';
import { UsersApi } from '../../../core/api/users.api';
import { AuthStore } from '../../../core/auth/auth-store';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

@Component({
  selector: 'app-profile-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, FormFieldComponent],
  template: `
    <app-card>
      <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4" novalidate>
        <h2 class="text-lg font-semibold">Profile</h2>

        @if (formError()) {
          <p
            class="rounded-lg bg-danger-600/10 px-3 py-2 text-sm text-danger-700 dark:text-danger-500"
            role="alert"
          >
            {{ formError() }}
          </p>
        }

        <app-form-field label="Name" for="settings-name" [error]="error('name')">
          <input id="settings-name" type="text" formControlName="name" autocomplete="name" />
        </app-form-field>

        <app-form-field
          label="Username"
          for="settings-username"
          [error]="error('username')"
          hint="Lowercase letters, numbers and underscore"
        >
          <input
            id="settings-username"
            type="text"
            formControlName="username"
            autocomplete="username"
          />
        </app-form-field>

        <p class="text-sm text-gray-500 dark:text-gray-400">
          Email: {{ currentUser()?.email }} (contact support to change it)
        </p>

        <div class="flex justify-end">
          <app-button type="submit" [loading]="saving()" [disabled]="form.pristine">
            Save changes
          </app-button>
        </div>
      </form>
    </app-card>
  `,
})
export class ProfileSettingsComponent {
  private readonly usersApi = inject(UsersApi);
  private readonly store = inject(AuthStore);
  private readonly toast = inject(ToastService);

  protected readonly currentUser = this.store.user;
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: [this.currentUser()?.name ?? '', [Validators.required, Validators.maxLength(100)]],
    username: [
      this.currentUser()?.username ?? '',
      [Validators.required, Validators.pattern(USERNAME_PATTERN)],
    ],
  });

  protected error(control: 'name' | 'username'): string | null {
    const field = this.form.controls[control];
    if (!field.touched || field.valid) {
      return null;
    }
    if (control === 'name') {
      return field.hasError('required') ? 'Name is required' : 'Name is too long';
    }
    return field.hasError('required')
      ? 'Username is required'
      : '3–30 characters: lowercase letters, numbers, or underscore';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.formError.set(null);

    this.usersApi.updateMe(this.form.getRawValue()).subscribe({
      next: (user) => {
        this.saving.set(false);
        this.store.setUser(user);
        this.form.markAsPristine();
        this.toast.success('Profile updated.');
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.formError.set(
          apiErrorStatus(error) === 409
            ? 'That username is already taken.'
            : apiErrorMessage(error, 'Could not save your profile.'),
        );
      },
    });
  }
}
