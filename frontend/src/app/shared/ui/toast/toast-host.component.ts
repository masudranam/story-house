import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

/** Renders queued toasts. Mounted once in the app shell. */
@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="pointer-events-none fixed right-4 top-20 z-50 flex w-full max-w-sm flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      @for (toast of toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 rounded-lg border-l-4 bg-white p-4 shadow-lg dark:bg-gray-800"
          [class.border-brand-600]="toast.kind === 'success'"
          [class.border-danger-600]="toast.kind === 'error'"
        >
          <p class="flex-1 text-sm text-gray-800 dark:text-gray-100">{{ toast.text }}</p>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Dismiss notification"
            (click)="toastService.dismiss(toast.id)"
          >
            &times;
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHostComponent {
  protected readonly toastService = inject(ToastService);
  protected readonly toasts = this.toastService.toasts;
}
