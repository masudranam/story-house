import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Story } from '../../../core/models/api.models';
import { RelativeDatePipe } from '../../../shared/ui/relative-date.pipe';

@Component({
  selector: 'app-story-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RelativeDatePipe],
  templateUrl: './story-card.component.html',
})
export class StoryCardComponent {
  readonly story = input.required<Story>();
  /** Owner/admin action affordances are decided by the parent page. */
  readonly canEdit = input(false);
  readonly canDelete = input(false);
  readonly editRequested = output<Story>();
  readonly deleteRequested = output<Story>();

  protected readonly excerpt = computed(() => {
    const content = this.story().content;
    return content.length > 180 ? `${content.slice(0, 180).trimEnd()}…` : content;
  });
}
