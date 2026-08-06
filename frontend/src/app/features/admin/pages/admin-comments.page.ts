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
import { CommentsApi } from '../../../core/api/comments.api';
import { Comment } from '../../../core/models/api.models';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PaginatorComponent } from '../../../shared/ui/paginator/paginator.component';
import { RelativeDatePipe } from '../../../shared/ui/relative-date.pipe';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-admin-comments-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ConfirmDialogComponent,
    EmptyStateComponent,
    PaginatorComponent,
    RelativeDatePipe,
    SkeletonComponent,
  ],
  templateUrl: './admin-comments.page.html',
})
export class AdminCommentsPage {
  private readonly commentsApi = inject(CommentsApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly pendingDelete = signal<Comment | null>(null);
  protected readonly deleting = signal(false);
  protected readonly skeletonRows = [0, 1, 2, 3, 4];

  private readonly queryParams = toSignal(inject(ActivatedRoute).queryParams, {
    initialValue: {} as Record<string, string | undefined>,
  });
  /** Backend searches content OR author username with this single term. */
  protected readonly search = computed(() => this.queryParams()['q'] ?? '');
  protected readonly page = computed(() => Number(this.queryParams()['page'] ?? '1') || 1);

  protected readonly comments = resource({
    params: () => ({ page: this.page(), search: this.search() }),
    loader: ({ params }) =>
      firstValueFrom(
        this.commentsApi.list({
          page: params.page,
          limit: PAGE_SIZE,
          search: params.search || undefined,
        }),
      ),
  });

  protected goToPage(page: number): void {
    void this.router.navigate([], {
      queryParams: { page: page === 1 ? null : page },
      queryParamsHandling: 'merge',
    });
  }

  protected confirmDelete(comment: Comment): void {
    this.pendingDelete.set(comment);
  }

  protected cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  protected deleteComment(): void {
    const comment = this.pendingDelete();
    if (!comment) {
      return;
    }
    this.deleting.set(true);
    this.commentsApi.delete(comment.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.toast.success('Comment removed.');
        this.comments.reload();
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.toast.error(apiErrorMessage(error, 'Could not remove the comment.'));
      },
    });
  }
}
