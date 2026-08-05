import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Label + control + inline error. The caller projects the control and passes
 * `for`/`error` so the label association is real (the legacy TextInput never
 * rendered an id, so its labels pointed at nothing).
 */
@Component({
  selector: 'app-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-1.5">
      <label [for]="for()" class="text-sm font-medium text-gray-700 dark:text-gray-200">
        {{ label() }}
      </label>
      <ng-content />
      @if (error()) {
        <p [id]="for() + '-error'" class="text-sm text-danger-600" role="alert">{{ error() }}</p>
      } @else if (hint()) {
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ hint() }}</p>
      }
    </div>
  `,
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  /** id of the projected control — used for htmlFor and the error element id. */
  readonly for = input.required<string>();
  readonly error = input<string | null>(null);
  readonly hint = input<string | null>(null);
}
