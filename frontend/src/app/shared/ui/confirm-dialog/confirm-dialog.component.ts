import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  OnDestroy,
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
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent implements AfterViewInit, OnDestroy {
  readonly title = input.required<string>();
  readonly message = input('');
  readonly confirmLabel = input('Delete');
  readonly cancelLabel = input('Cancel');
  readonly loading = input(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly titleId = `confirm-dialog-title-${Math.random().toString(36).slice(2, 9)}`;
  private readonly dialog = viewChild.required<ElementRef<HTMLElement>>('dialog');

  /** Element to hand focus back to when the dialog closes (a11y requirement). */
  private readonly invoker = document.activeElement as HTMLElement | null;

  ngAfterViewInit(): void {
    this.dialog().nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.invoker?.focus?.();
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
