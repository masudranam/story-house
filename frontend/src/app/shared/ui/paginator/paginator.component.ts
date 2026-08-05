import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-paginator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    @if (totalPages() > 1) {
      <nav class="flex items-center justify-center gap-4 py-4" aria-label="Pagination">
        <app-button
          variant="ghost"
          [disabled]="page() <= 1 || disabled()"
          (clicked)="pageChange.emit(page() - 1)"
        >
          Previous
        </app-button>
        <span class="text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
          Page {{ page() }} of {{ totalPages() }}
        </span>
        <app-button
          variant="ghost"
          [disabled]="page() >= totalPages() || disabled()"
          (clicked)="pageChange.emit(page() + 1)"
        >
          Next
        </app-button>
      </nav>
    }
  `,
})
export class PaginatorComponent {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly disabled = input(false);
  readonly pageChange = output<number>();

  /** Exposed for tests/templates that want to know whether anything renders. */
  readonly visible = computed(() => this.totalPages() > 1);
}
