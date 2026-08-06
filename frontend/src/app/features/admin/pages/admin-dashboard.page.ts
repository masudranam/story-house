import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UsersApi } from '../../../core/api/users.api';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-admin-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EmptyStateComponent, SkeletonComponent],
  template: `
    <h2 class="text-xl font-semibold">Platform overview</h2>

    @if (stats.isLoading()) {
      <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @for (row of skeletonRows; track row) {
          <div class="rounded-card border border-gray-200 p-5 dark:border-gray-700">
            <app-skeleton height="0.75rem" width="50%" />
            <div class="mt-3"><app-skeleton height="2rem" width="30%" /></div>
          </div>
        }
      </div>
    } @else if (stats.error()) {
      <div class="mt-4">
        <app-empty-state title="Couldn't load statistics" />
      </div>
    } @else if (stats.value(); as data) {
      <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a
          routerLink="/admin/users"
          class="rounded-card border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
        >
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Total users
          </p>
          <p class="mt-2 text-3xl font-bold">{{ data.totalUsers }}</p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            +{{ data.newUsersThisWeek }} this week
          </p>
        </a>

        <a
          routerLink="/admin/stories"
          class="rounded-card border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
        >
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Total stories
          </p>
          <p class="mt-2 text-3xl font-bold">{{ data.totalStories }}</p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            +{{ data.newStoriesThisWeek }} this week
          </p>
        </a>

        <a
          routerLink="/admin/comments"
          class="rounded-card border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
        >
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Total comments
          </p>
          <p class="mt-2 text-3xl font-bold">{{ data.totalComments }}</p>
        </a>
      </div>
    }
  `,
})
export class AdminDashboardPage {
  private readonly usersApi = inject(UsersApi);
  protected readonly skeletonRows = [0, 1, 2];

  protected readonly stats = resource({
    loader: () => firstValueFrom(this.usersApi.stats()),
  });
}
