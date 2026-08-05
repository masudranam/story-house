import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Empty list placeholder with room for a call to action. */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col items-center gap-3 rounded-card border border-dashed border-gray-300 bg-white/50 px-6 py-12 text-center dark:border-gray-600 dark:bg-gray-900/50"
    >
      <p class="text-base font-medium text-gray-700 dark:text-gray-200">{{ title() }}</p>
      @if (message()) {
        <p class="max-w-prose text-sm text-gray-500 dark:text-gray-400">{{ message() }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly message = input<string | null>(null);
}
