import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

/** Placeholder — profile + user's stories land in Phase 10. */
@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
  template: `
    <h1>Profile</h1>
    <div class="mt-6">
      <app-empty-state title="Profiles are coming in Phase 10" />
    </div>
  `,
})
export class ProfilePage {}
