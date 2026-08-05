import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer class="mt-12 border-t border-gray-200 py-6 dark:border-gray-800">
      <div
        class="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-sm text-gray-500 sm:flex-row sm:justify-between dark:text-gray-400"
      >
        <p>&copy; {{ year }} StoryHouse</p>
        <a routerLink="/about" class="hover:text-brand-600 dark:hover:text-brand-300">About</a>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}
