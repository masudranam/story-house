import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage, apiErrorStatus } from '../../../core/api/api-error';
import { StoriesApi } from '../../../core/api/stories.api';
import { AuthStore } from '../../../core/auth/auth-store';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { RelativeDatePipe } from '../../../shared/ui/relative-date.pipe';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CommentListComponent } from '../components/comment-list.component';
import { LikeButtonComponent } from '../components/like-button.component';

@Component({
  selector: 'app-story-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonComponent,
    CommentListComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    LikeButtonComponent,
    RelativeDatePipe,
    SkeletonComponent,
  ],
  templateUrl: './story-detail.page.html',
})
export class StoryDetailPage {
  /** Route param, bound by withComponentInputBinding(). */
  readonly id = input.required<string>();

  private readonly storiesApi = inject(StoriesApi);
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly isAuthenticated = this.store.isAuthenticated;
  protected readonly pendingDelete = signal(false);
  protected readonly deleting = signal(false);
  protected readonly likeInFlight = signal(false);

  /** Optimistic like overlay: null = show server truth. */
  private readonly likeOverride = signal<{ liked: boolean; count: number } | null>(null);

  protected readonly story = resource({
    params: () => ({ id: this.id() }),
    loader: ({ params }) => firstValueFrom(this.storiesApi.get(params.id)),
  });

  /** 404 gets a "not found" page; anything else is a load failure worth retrying. */
  protected readonly notFound = computed(() => apiErrorStatus(this.story.error()) === 404);

  constructor() {
    // A reused component must not show the previous story's like state.
    effect(() => {
      this.id();
      this.likeOverride.set(null);
      this.likeInFlight.set(false);
    });
  }

  protected readonly liked = computed(
    () => this.likeOverride()?.liked ?? this.story.value()?.likedByMe ?? false,
  );
  protected readonly likesCount = computed(
    () => this.likeOverride()?.count ?? this.story.value()?.likesCount ?? 0,
  );

  protected readonly canEdit = computed(
    () => this.store.user()?.id === this.story.value()?.author.id,
  );
  protected readonly canDelete = computed(() => this.canEdit() || this.store.isAdmin());

  protected toggleLike(): void {
    const story = this.story.value();
    if (!story || !this.isAuthenticated()) {
      return;
    }
    const nextLiked = !this.liked();
    const nextCount = Math.max(0, this.likesCount() + (nextLiked ? 1 : -1));
    // Optimistic: paint the new state immediately, roll back on failure.
    this.likeOverride.set({ liked: nextLiked, count: nextCount });
    this.likeInFlight.set(true);

    const request = nextLiked ? this.storiesApi.like(story.id) : this.storiesApi.unlike(story.id);
    request.subscribe({
      next: () => this.likeInFlight.set(false),
      error: (error: unknown) => {
        this.likeInFlight.set(false);
        this.likeOverride.set(null);
        this.toast.error(apiErrorMessage(error, 'Could not update your like.'));
      },
    });
  }

  protected confirmDelete(): void {
    this.pendingDelete.set(true);
  }

  protected cancelDelete(): void {
    this.pendingDelete.set(false);
  }

  protected deleteStory(): void {
    const story = this.story.value();
    if (!story) {
      return;
    }
    this.deleting.set(true);
    this.storiesApi.delete(story.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.pendingDelete.set(false);
        this.toast.success('Story deleted.');
        void this.router.navigateByUrl('/');
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.pendingDelete.set(false);
        this.toast.error(apiErrorMessage(error, 'Could not delete the story.'));
      },
    });
  }
}
