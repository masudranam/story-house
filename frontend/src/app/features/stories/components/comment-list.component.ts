import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api-error';
import { CommentsApi } from '../../../core/api/comments.api';
import { AuthStore } from '../../../core/auth/auth-store';
import { Comment } from '../../../core/models/api.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PaginatorComponent } from '../../../shared/ui/paginator/paginator.component';
import { RelativeDatePipe } from '../../../shared/ui/relative-date.pipe';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-comment-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    PaginatorComponent,
    RelativeDatePipe,
    SkeletonComponent,
  ],
  templateUrl: './comment-list.component.html',
})
export class CommentListComponent {
  readonly storyId = input.required<string>();

  private readonly commentsApi = inject(CommentsApi);
  private readonly store = inject(AuthStore);
  private readonly toast = inject(ToastService);

  protected readonly isAuthenticated = this.store.isAuthenticated;
  protected readonly page = signal(1);
  protected readonly posting = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly savingEdit = signal(false);
  protected readonly pendingDelete = signal<Comment | null>(null);
  protected readonly deleting = signal(false);
  protected readonly skeletonRows = [0, 1, 2];

  protected readonly newComment = inject(FormBuilder).nonNullable.group({
    content: ['', [Validators.required, Validators.maxLength(2000)]],
  });
  protected readonly editForm = inject(FormBuilder).nonNullable.group({
    content: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  /** Signals mirroring touched state, since Angular forms aren't signal-based yet. */
  private readonly newCommentTouched = signal(false);
  private readonly editTouched = signal(false);

  protected readonly comments = resource({
    params: () => ({ storyId: this.storyId(), page: this.page() }),
    loader: ({ params }) =>
      firstValueFrom(this.commentsApi.listForStory(params.storyId, params.page, PAGE_SIZE)),
  });

  /** Inline validation messages (rule 40: touched+invalid must say why). */
  protected readonly newCommentError = computed(() =>
    this.validationMessage(this.newCommentTouched(), this.newComment.controls.content.errors),
  );
  protected readonly editError = computed(() =>
    this.validationMessage(this.editTouched(), this.editForm.controls.content.errors),
  );

  protected goToPage(page: number): void {
    this.page.set(page);
  }

  private validationMessage(touched: boolean, errors: ValidationErrors | null): string | null {
    if (!touched || !errors) {
      return null;
    }
    return errors['required']
      ? 'Write something before posting'
      : 'Comments are limited to 2000 characters';
  }

  protected canModify(comment: Comment): boolean {
    return this.store.user()?.id === comment.author.id;
  }

  protected canDelete(comment: Comment): boolean {
    return this.canModify(comment) || this.store.isAdmin();
  }

  protected post(): void {
    if (this.newComment.invalid) {
      this.newComment.markAllAsTouched();
      this.newCommentTouched.set(true);
      return;
    }
    this.posting.set(true);
    this.commentsApi
      .createForStory(this.storyId(), this.newComment.getRawValue().content)
      .subscribe({
        next: () => {
          this.posting.set(false);
          this.newComment.reset();
          this.newCommentTouched.set(false);
          this.page.set(1);
          this.comments.reload();
        },
        error: (error: unknown) => {
          this.posting.set(false);
          this.toast.error(apiErrorMessage(error, 'Could not post your comment.'));
        },
      });
  }

  protected startEdit(comment: Comment): void {
    this.editingId.set(comment.id);
    this.editForm.setValue({ content: comment.content });
    this.editTouched.set(false);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.editTouched.set(false);
  }

  protected saveEdit(comment: Comment): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.editTouched.set(true);
      return;
    }
    this.savingEdit.set(true);
    this.commentsApi.update(comment.id, this.editForm.getRawValue().content).subscribe({
      next: () => {
        this.savingEdit.set(false);
        this.editingId.set(null);
        this.comments.reload();
      },
      error: (error: unknown) => {
        this.savingEdit.set(false);
        this.toast.error(apiErrorMessage(error, 'Could not save your changes.'));
      },
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
        this.toast.success('Comment deleted.');
        this.comments.reload();
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.toast.error(apiErrorMessage(error, 'Could not delete the comment.'));
      },
    });
  }
}
