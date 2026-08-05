import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';

/**
 * Modal confirm for destructive actions: backdrop, ARIA dialog semantics,
 * Escape to cancel, and a focus trap cycling within the dialog. Replaces the
 * legacy app's three hand-rolled, unfocusable confirm widgets.
 */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Click-to-dismiss backdrop as a real button so it is keyboard- and
           screen-reader-addressable (Escape on the dialog does the same). -->
      <button
        type="button"
        class="absolute inset-0 cursor-default bg-black/50"
        tabindex="-1"
        aria-label="Dismiss dialog"
        (click)="cancelled.emit()"
      ></button>
      <div
        #dialog
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        class="relative w-full max-w-md rounded-card bg-white p-6 shadow-xl dark:bg-gray-900"
        tabindex="-1"
        (keydown)="onKeydown($event)"
      >
        <h2 [id]="titleId" class="text-lg font-semibold text-gray-900 dark:text-gray-50">
          {{ title() }}
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">{{ message() }}</p>
        <div class="mt-6 flex justify-end gap-3">
          <app-button variant="ghost" (clicked)="cancelled.emit()">
            {{ cancelLabel() }}
          </app-button>
          <app-button variant="danger" [loading]="loading()" (clicked)="confirmed.emit()">
            {{ confirmLabel() }}
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent implements AfterViewInit {
  readonly title = input.required<string>();
  readonly message = input('');
  readonly confirmLabel = input('Delete');
  readonly cancelLabel = input('Cancel');
  readonly loading = input(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly titleId = `confirm-dialog-title-${Math.random().toString(36).slice(2, 9)}`;
  private readonly dialog = viewChild.required<ElementRef<HTMLElement>>('dialog');

  ngAfterViewInit(): void {
    this.dialog().nativeElement.focus();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelled.emit();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    const focusable = Array.from(
      this.dialog().nativeElement.querySelectorAll<HTMLElement>('button:not([disabled])'),
    );
    if (focusable.length === 0) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === this.dialog().nativeElement)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
