import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileSettingsComponent } from '../components/profile-settings.component';
import { SecuritySettingsComponent } from '../components/security-settings.component';

type Tab = 'profile' | 'security';

@Component({
  selector: 'app-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProfileSettingsComponent, SecuritySettingsComponent],
  template: `
    <div class="mx-auto max-w-2xl">
      <h1>Settings</h1>

      <div class="mt-6 flex gap-2 border-b border-gray-200 dark:border-gray-700" role="tablist">
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="tab() === 'profile'"
          [class]="tabClass('profile')"
          (click)="select('profile')"
        >
          Profile
        </button>
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="tab() === 'security'"
          [class]="tabClass('security')"
          (click)="select('security')"
        >
          Security
        </button>
      </div>

      <div class="mt-6">
        @switch (tab()) {
          @case ('profile') {
            <app-profile-settings />
          }
          @case ('security') {
            <app-security-settings />
          }
        }
      </div>
    </div>
  `,
})
export class SettingsPage {
  private readonly router = inject(Router);
  protected readonly tab = signal<Tab>(
    this.router.url.includes('security') ? 'security' : 'profile',
  );

  protected select(tab: Tab): void {
    this.tab.set(tab);
  }

  protected tabClass(tab: Tab): string {
    const base = 'px-4 py-2 text-sm font-medium transition-colors';
    return this.tab() === tab
      ? `${base} border-b-2 border-brand-600 text-brand-700 dark:text-brand-300`
      : `${base} text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100`;
  }
}
