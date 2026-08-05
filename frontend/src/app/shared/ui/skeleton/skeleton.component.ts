import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Pulse placeholder — used instead of blocking spinners while data loads. */
@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="animate-pulse rounded bg-gray-200 dark:bg-gray-700"
      [style.height]="height()"
      [style.width]="width()"
      aria-hidden="true"
    ></div>
  `,
})
export class SkeletonComponent {
  readonly height = input('1rem');
  readonly width = input('100%');
}
