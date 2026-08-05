import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

/** Placeholder — the real story feed lands in Phase 9. */
@Component({
  selector: 'app-story-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
  template: `
    <h1>Stories</h1>
    <div class="mt-6">
      <app-empty-state
        title="The story feed is coming in Phase 9"
        message="Backend endpoints are live; this page gets its cards, search, and pagination next."
      />
    </div>
  `,
})
export class StoryListPage {}
