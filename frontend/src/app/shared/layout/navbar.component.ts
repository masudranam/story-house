import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { debounceTime, distinctUntilChanged, map, startWith, Subject } from 'rxjs';
import { AuthStore } from '../../core/auth/auth-store';

const SEARCH_DEBOUNCE_MS = 350;
const SEARCHLESS_ROUTES = ['/login', '/signup'];

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly store = inject(AuthStore);

  protected readonly user = this.store.user;
  protected readonly isAuthenticated = this.store.isAuthenticated;
  protected readonly isAdmin = this.store.isAdmin;

  protected readonly menuOpen = signal(false);
  protected readonly searchTerm = signal('');

  private readonly searchInput$ = new Subject<string>();
  private readonly debouncedSearch = toSignal(
    this.searchInput$.pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged()),
    { initialValue: null },
  );

  /** Hide the search box where it means nothing (auth pages). */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: '/' },
  );
  protected readonly showSearch = computed(
    () => !SEARCHLESS_ROUTES.some((route) => this.currentUrl().startsWith(route)),
  );

  protected readonly initial = computed(() => {
    const user = this.user();
    return user ? (user.name.trim()[0] ?? user.username[0]).toUpperCase() : '?';
  });

  constructor() {
    // Debounced search writes ?q= onto whatever route the user is on.
    effect(() => {
      const term = this.debouncedSearch();
      if (term === null) {
        return;
      }
      void this.router.navigate([], {
        queryParams: { q: term || null, page: null },
        queryParamsHandling: 'merge',
      });
    });
  }

  protected onSearchInput(value: string): void {
    this.searchTerm.set(value);
    this.searchInput$.next(value.trim());
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected logout(): void {
    this.closeMenu();
    this.store.logout();
  }
}
