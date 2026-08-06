import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-like-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './like-button.component.html',
})
export class LikeButtonComponent {
  readonly liked = input(false);
  readonly count = input(0);
  readonly disabled = input(false);
  readonly toggled = output<void>();
}
