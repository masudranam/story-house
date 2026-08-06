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
import { StoriesApi } from '../../../core/api/stories.api';
import { Story, StorySort } from '../../../core/models/api.models';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PaginatorComponent } from '../../../shared/ui/paginator/paginator.component';
import { RelativeDatePipe } from '../../../shared/ui/relative-date.pipe';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-admin-stories-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ConfirmDialogComponent,
    EmptyStateComponent,
    PaginatorComponent,
    RelativeDatePipe,
    SkeletonComponent,
  ],
  templateUrl: './admin-stories.page.html',
})
export class AdminStoriesPage {
  private readonly storiesApi = inject(StoriesApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly sort = signal<StorySort>('createdAt:desc');
  protected readonly pendingDelete = signal<Story | null>(null);
  protected readonly deleting = signal(false);
  protected readonly skeletonRows = [0, 1, 2, 3, 4];

  private readonly queryParams = toSignal(inject(ActivatedRoute).queryParams, {
    initialValue: {} as Record<string, string | undefined>,
  });
  protected readonly search = computed(() => this.queryParams()['q'] ?? '');
  protected readonly page = computed(() => Number(this.queryParams()['page'] ?? '1') || 1);

  protected readonly stories = resource({
    params: () => ({ page: this.page(), search: this.search(), sort: this.sort() }),
    loader: ({ params }) =>
      firstValueFrom(
        this.storiesApi.list({
          page: params.page,
          limit: PAGE_SIZE,
          search: params.search || undefined,
          sort: params.sort,
        }),
      ),
  });

  protected setSort(value: string): void {
    this.sort.set(value === 'createdAt:asc' ? 'createdAt:asc' : 'createdAt:desc');
    this.goToPage(1);
  }

  protected goToPage(page: number): void {
    void this.router.navigate([], {
      queryParams: { page: page === 1 ? null : page },
      queryParamsHandling: 'merge',
    });
  }

  protected confirmDelete(story: Story): void {
    this.pendingDelete.set(story);
  }

  protected cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  protected deleteStory(): void {
    const story = this.pendingDelete();
    if (!story) {
      return;
    }
    this.deleting.set(true);
    this.storiesApi.delete(story.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.toast.success('Story removed.');
        this.stories.reload();
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.toast.error(apiErrorMessage(error, 'Could not remove the story.'));
      },
    });
  }
}
