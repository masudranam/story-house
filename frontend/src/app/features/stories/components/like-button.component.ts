import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-like-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
      [class]="
        liked()
          ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
          : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800'
      "
      [disabled]="disabled()"
      [attr.aria-pressed]="liked()"
      [attr.aria-label]="liked() ? 'Unlike this story' : 'Like this story'"
      (click)="toggled.emit()"
    >
      <span aria-hidden="true">{{ liked() ? '♥' : '♡' }}</span>
      <span>{{ count() }} {{ count() === 1 ? 'like' : 'likes' }}</span>
    </button>
  `,
})
export class LikeButtonComponent {
  readonly liked = input(false);
  readonly count = input(0);
  readonly disabled = input(false);
  readonly toggled = output<void>();
}
