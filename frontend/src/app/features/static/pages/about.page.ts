import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="prose mx-auto max-w-prose">
      <h1>About StoryHouse</h1>
      <p class="mt-4 text-gray-600 dark:text-gray-300">
        StoryHouse is a place to write and share short stories. Publish your own, read what others
        have written, and join the conversation in the comments.
      </p>
    </article>
  `,
})
export class AboutPage {}
