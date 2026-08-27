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
  templateUrl: './admin-dashboard.page.html',
})
export class AdminDashboardPage {
  private readonly usersApi = inject(UsersApi);
  protected readonly skeletonRows = [0, 1, 2];

  protected readonly stats = resource({
    loader: () => firstValueFrom(this.usersApi.stats()),
  });
}
