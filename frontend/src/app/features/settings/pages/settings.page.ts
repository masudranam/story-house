import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ProfileSettingsComponent } from '../components/profile-settings.component';
import { SecuritySettingsComponent } from '../components/security-settings.component';

type Tab = 'profile' | 'security';

@Component({
  selector: 'app-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProfileSettingsComponent, SecuritySettingsComponent],
  templateUrl: './settings.page.html',
})
export class SettingsPage {
  private readonly router = inject(Router);

  /** Derived from the URL so /settings/security is a real, shareable link. */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );
  protected readonly tab = computed<Tab>(() =>
    this.url().includes('/settings/security') ? 'security' : 'profile',
  );

  protected readonly tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
  ];

  protected select(tab: Tab): void {
    void this.router.navigateByUrl(tab === 'security' ? '/settings/security' : '/settings');
  }

  /** ArrowLeft/ArrowRight move between tabs (WAI-ARIA tabs pattern). */
  protected onTabKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }
    event.preventDefault();
    const current = this.tabs.findIndex((t) => t.id === this.tab());
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const next = this.tabs[(current + offset + this.tabs.length) % this.tabs.length];
    this.select(next.id);
  }

  protected tabClass(tab: Tab): string {
    const base = 'px-4 py-2 text-sm font-medium transition-colors';
    return this.tab() === tab
      ? `${base} border-b-2 border-brand-600 text-brand-700 dark:text-brand-300`
      : `${base} text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100`;
  }
}
