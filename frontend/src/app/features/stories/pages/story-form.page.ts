import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

/** Placeholder — create/edit story form lands in Phase 9. */
@Component({
  selector: 'app-story-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
  template: `
    <h1>Write a story</h1>
    <div class="mt-6">
      <app-empty-state title="The editor is coming in Phase 9" />
    </div>
  `,
})
export class StoryFormPage {}
