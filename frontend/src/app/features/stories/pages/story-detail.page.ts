import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

/** Placeholder — story detail, likes, and comments land in Phase 9. */
@Component({
  selector: 'app-story-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
  template: `
    <h1>Story</h1>
    <div class="mt-6">
      <app-empty-state title="Story detail is coming in Phase 9" />
    </div>
  `,
})
export class StoryDetailPage {}
