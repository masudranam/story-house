import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'ghost' | 'danger';

@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly full = input(false);
  readonly clicked = output<void>();

  private static readonly BASE =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';

  private static readonly VARIANTS: Record<ButtonVariant, string> = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    ghost:
      'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-800',
    danger: 'bg-danger-600 text-white hover:brightness-110',
  };

  protected readonly classes = computed(
    () =>
      `${ButtonComponent.BASE} ${ButtonComponent.VARIANTS[this.variant()]} ${
        this.full() ? 'w-full' : ''
      }`,
  );
}
