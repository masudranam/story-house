import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { UsersApi } from '../../../core/api/users.api';
import { AuthStore } from '../../../core/auth/auth-store';
import { Role, User } from '../../../core/models/api.models';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PaginatorComponent } from '../../../shared/ui/paginator/paginator.component';
import { RelativeDatePipe } from '../../../shared/ui/relative-date.pipe';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-admin-users-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ConfirmDialogComponent,
    EmptyStateComponent,
    PaginatorComponent,
    RelativeDatePipe,
    SkeletonComponent,
  ],
  templateUrl: './admin-users.page.html',
})
export class AdminUsersPage {
  private readonly usersApi = inject(UsersApi);
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly roleFilter = signal<Role | ''>('');
  protected readonly pendingDelete = signal<User | null>(null);
  protected readonly deleting = signal(false);
  protected readonly skeletonRows = [0, 1, 2, 3, 4];

  private readonly queryParams = toSignal(inject(ActivatedRoute).queryParams, {
    initialValue: {} as Record<string, string | undefined>,
  });
  protected readonly search = computed(() => this.queryParams()['q'] ?? '');
  protected readonly page = computed(() => Number(this.queryParams()['page'] ?? '1') || 1);

  protected readonly users = resource({
    params: () => ({ page: this.page(), search: this.search(), role: this.roleFilter() }),
    loader: ({ params }) =>
      firstValueFrom(
        this.usersApi.list({
          page: params.page,
          limit: PAGE_SIZE,
          search: params.search || undefined,
          role: params.role || undefined,
        }),
      ),
  });

  /** The backend rejects admin self-deletion with 403 — don't offer it. */
  protected isSelf(user: User): boolean {
    return this.store.user()?.id === user.id;
  }

  protected setRole(value: string): void {
    this.roleFilter.set(value === 'USER' || value === 'ADMIN' ? value : '');
    this.goToPage(1);
  }

  protected goToPage(page: number): void {
    void this.router.navigate([], {
      queryParams: { page: page === 1 ? null : page },
      queryParamsHandling: 'merge',
    });
  }

  protected confirmDelete(user: User): void {
    this.pendingDelete.set(user);
  }

  protected cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  protected deleteUser(): void {
    const user = this.pendingDelete();
    if (!user) {
      return;
    }
    this.deleting.set(true);
    this.usersApi.deleteUser(user.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.toast.success(`Deleted ${user.username}.`);
        this.users.reload();
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.toast.error(apiErrorMessage(error, 'Could not delete the user.'));
      },
    });
  }
}
