import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map, startWith, Subject } from 'rxjs';
import { AuthStore } from '../../core/auth/auth-store';

const SEARCH_DEBOUNCE_MS = 350;
const SEARCHLESS_ROUTES = ['/login', '/signup'];

/** Routes whose pages read `?q=` themselves; elsewhere search goes to the feed. */
const SEARCH_AWARE_ROUTES = ['/profile', '/admin/users', '/admin/stories', '/admin/comments'];

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(AuthStore);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

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

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
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
    // Keep the box in sync with the URL so a shared/reloaded ?q= link shows its term.
    effect(() => {
      const url = this.currentUrl();
      const queryTerm = this.route.snapshot.queryParamMap.get('q') ?? '';
      if (queryTerm !== this.searchTerm() && !url.startsWith('/login')) {
        this.searchTerm.set(queryTerm);
      }
    });

    effect(() => {
      const term = this.debouncedSearch();
      if (term === null) {
        return;
      }
      const url = this.currentUrl();
      const searchAware = SEARCH_AWARE_ROUTES.some((route) => url.startsWith(route));
      // Search-aware pages filter in place; anywhere else, searching means
      // "find stories", so send the query to the feed instead of dropping it.
      void this.router.navigate(searchAware ? [] : ['/'], {
        queryParams: { q: term || null, page: null },
        queryParamsHandling: searchAware ? 'merge' : '',
      });
    });
  }

  /** Click-outside and Escape close the account menu (required for role="menu"). */
  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.menuOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.menuOpen.set(false);
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

  /** Arrow keys move between menu items; Escape closes (WAI-ARIA menu pattern). */
  protected onMenuKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }
    event.preventDefault();
    const items = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    if (items.length === 0) {
      return;
    }
    const current = items.indexOf(document.activeElement as HTMLElement);
    const offset = event.key === 'ArrowDown' ? 1 : -1;
    const next = current === -1 ? 0 : (current + offset + items.length) % items.length;
    items[next].focus();
  }

  protected logout(): void {
    this.closeMenu();
    this.store.logout();
  }
}
