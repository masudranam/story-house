import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { StoriesApi } from '../../../core/api/stories.api';
import { UsersApi } from '../../../core/api/users.api';
import { AuthStore } from '../../../core/auth/auth-store';
import { PublicUser, Story, User } from '../../../core/models/api.models';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PaginatorComponent } from '../../../shared/ui/paginator/paginator.component';
import { RelativeDatePipe } from '../../../shared/ui/relative-date.pipe';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { StoryCardComponent } from '../../stories/components/story-card.component';

const PAGE_SIZE = 6;

function hasEmail(value: PublicUser | User | undefined): value is User {
  return value !== undefined && 'email' in value;
}

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    CardComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    PaginatorComponent,
    RelativeDatePipe,
    SkeletonComponent,
    StoryCardComponent,
  ],
  templateUrl: './profile.page.html',
})
export class ProfilePage {
  /** Absent on /profile (own profile); a user id on /profile/:id. */
  readonly id = input<string | undefined>(undefined);

  private readonly usersApi = inject(UsersApi);
  private readonly storiesApi = inject(StoriesApi);
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly currentUser = this.store.user;
  protected readonly isAdmin = this.store.isAdmin;
  protected readonly pendingDelete = signal<Story | null>(null);
  protected readonly deleting = signal(false);
  protected readonly skeletonRows = [0, 1, 2];

  /** Own profile when there's no :id, or the id matches the signed-in user. */
  protected readonly isOwnProfile = computed(() => {
    const routeId = this.id();
    return routeId === undefined || routeId === this.currentUser()?.id;
  });

  private readonly queryParams = toSignal(inject(ActivatedRoute).queryParams, {
    initialValue: {} as Record<string, string | undefined>,
  });
  protected readonly search = computed(() => this.queryParams()['q'] ?? '');
  protected readonly page = computed(() => Number(this.queryParams()['page'] ?? '1') || 1);

  /** Own profile reads /users/me (includes email); others read the public profile. */
  protected readonly profile = resource({
    params: () => ({ id: this.id(), own: this.isOwnProfile() }),
    loader: ({ params }) =>
      params.own || !params.id
        ? firstValueFrom(this.usersApi.me())
        : firstValueFrom(this.usersApi.publicProfile(params.id)),
  });

  protected readonly authorId = computed(() => this.id() ?? this.currentUser()?.id);

  protected readonly stories = resource({
    params: () => ({ authorId: this.authorId(), page: this.page(), search: this.search() }),
    loader: ({ params }) =>
      params.authorId
        ? firstValueFrom(
            this.storiesApi.list({
              authorId: params.authorId,
              page: params.page,
              limit: PAGE_SIZE,
              search: params.search || undefined,
            }),
          )
        : Promise.resolve({
            data: [],
            meta: { page: 1, limit: PAGE_SIZE, totalItems: 0, totalPages: 1 },
          }),
  });

  protected readonly initial = computed(() => {
    const name = this.profile.value()?.name ?? '';
    return (name.trim()[0] ?? '?').toUpperCase();
  });

  /** Only the own-profile response (`/users/me`) carries an email. */
  protected email(): string | null {
    const value = this.profile.value();
    return hasEmail(value) ? value.email : null;
  }

  protected canEdit(story: Story): boolean {
    return this.currentUser()?.id === story.author.id;
  }

  protected canDelete(story: Story): boolean {
    return this.canEdit(story) || this.isAdmin();
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
