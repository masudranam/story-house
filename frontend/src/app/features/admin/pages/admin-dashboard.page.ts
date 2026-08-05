import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

/** Placeholder — admin dashboard and moderation tables land in Phase 11. */
@Component({
  selector: 'app-admin-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
  template: `
    <h1>Admin</h1>
    <div class="mt-6">
      <app-empty-state
        title="The admin panel is coming in Phase 11"
        message="This route is already protected by adminGuard — the legacy app had no admin guard at all."
      />
    </div>
  `,
})
export class AdminDashboardPage {}
