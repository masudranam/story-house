import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

/** Placeholder — profile/security settings land in Phase 10. */
@Component({
  selector: 'app-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
  template: `
    <h1>Settings</h1>
    <div class="mt-6">
      <app-empty-state title="Settings are coming in Phase 10" />
    </div>
  `,
})
export class SettingsPage {}
