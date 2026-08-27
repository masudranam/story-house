import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/layout/footer.component';
import { NavbarComponent } from './shared/layout/navbar.component';
import { ToastHostComponent } from './shared/ui/toast/toast-host.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastHostComponent],
  templateUrl: './app.html',
  host: { class: 'flex min-h-screen flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
