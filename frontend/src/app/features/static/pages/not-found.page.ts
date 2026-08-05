import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-md text-center">
      <p class="text-sm font-semibold text-brand-600 dark:text-brand-300">404</p>
      <h1 class="mt-2">Page not found</h1>
      <p class="mt-3 text-gray-600 dark:text-gray-300">
        That page doesn't exist — it may have been moved or deleted.
      </p>
      <a
        routerLink="/"
        class="mt-6 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Back to stories
      </a>
    </div>
  `,
})
export class NotFoundPage {}
