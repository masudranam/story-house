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
import { AuthStore } from '../../../core/auth/auth-store';
import { Story, StorySort } from '../../../core/models/api.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PaginatorComponent } from '../../../shared/ui/paginator/paginator.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { StoryCardComponent } from '../components/story-card.component';

const PAGE_SIZE = 9;

@Component({
  selector: 'app-story-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    PaginatorComponent,
    SkeletonComponent,
    StoryCardComponent,
  ],
  templateUrl: './story-list.page.html',
})
export class StoryListPage {
  private readonly storiesApi = inject(StoriesApi);
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly isAuthenticated = this.store.isAuthenticated;
  protected readonly sort = signal<StorySort>('createdAt:desc');
  protected readonly pendingDelete = signal<Story | null>(null);
  protected readonly deleting = signal(false);

  /** ?q= (navbar search) and ?page= drive the query — shareable, reload-safe URLs. */
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

  protected readonly skeletonRows = [0, 1, 2, 3, 4, 5];

  protected canEdit(story: Story): boolean {
    return this.store.user()?.id === story.author.id;
  }

  protected canDelete(story: Story): boolean {
    return this.canEdit(story) || this.store.isAdmin();
  }

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

  protected edit(story: Story): void {
    void this.router.navigate(['/stories', story.id, 'edit']);
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
        this.toast.success('Story deleted.');
        this.stories.reload();
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.toast.error(apiErrorMessage(error, 'Could not delete the story.'));
      },
    });
  }
}
