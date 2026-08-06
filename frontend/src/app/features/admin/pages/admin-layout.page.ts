import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/** Admin shell: its own sub-navigation under the main app shell. */
@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <h1>Admin</h1>

    <nav
      class="mt-4 flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700"
      aria-label="Admin sections"
    >
      @for (link of links; track link.path) {
        <a
          [routerLink]="link.path"
          routerLinkActive="border-b-2 border-brand-600 text-brand-700 dark:text-brand-300"
          [routerLinkActiveOptions]="{ exact: true }"
          class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          {{ link.label }}
        </a>
      }
    </nav>

    <div class="mt-6">
      <router-outlet />
    </div>
  `,
})
export class AdminLayoutPage {
  protected readonly links = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/stories', label: 'Stories' },
    { path: '/admin/comments', label: 'Comments' },
  ];
}
