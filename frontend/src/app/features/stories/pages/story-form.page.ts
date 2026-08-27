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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage, apiErrorStatus } from '../../../core/api/api-error';
import { StoriesApi } from '../../../core/api/stories.api';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { FormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-story-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    FormFieldComponent,
    SkeletonComponent,
  ],
  templateUrl: './story-form.page.html',
})
export class StoryFormPage {
  /** Route param via withComponentInputBinding(); absent = create mode. */
  readonly id = input<string | undefined>(undefined);

  private readonly storiesApi = inject(StoriesApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly isEdit = computed(() => this.id() !== undefined);
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    content: ['', [Validators.required]],
  });

  /**
   * Keyed on the route id, so navigating edit(A) → edit(B) reloads instead of
   * silently keeping A's text (which would PATCH B with A's body).
   */
  protected readonly existing = resource({
    params: () => ({ id: this.id() }),
    loader: ({ params }) =>
      params.id ? firstValueFrom(this.storiesApi.get(params.id)) : Promise.resolve(undefined),
  });

  protected readonly loading = computed(() => this.isEdit() && this.existing.isLoading());

  constructor() {
    // Prefill from whatever the resource currently holds for this id.
    effect(() => {
      const story = this.existing.value();
      if (story) {
        this.form.setValue({ title: story.title, content: story.content });
        this.form.markAsPristine();
      }
    });

    effect(() => {
      if (!this.existing.error()) {
        return;
      }
      const error = this.existing.error();
      this.toast.error(
        apiErrorStatus(error) === 404
          ? 'That story no longer exists.'
          : apiErrorMessage(error, 'Could not load the story.'),
      );
      void this.router.navigateByUrl('/');
    });
  }

  protected error(control: 'title' | 'content'): string | null {
    const field = this.form.controls[control];
    if (!field.touched || field.valid) {
      return null;
    }
    if (control === 'title') {
      return field.hasError('required') ? 'Give your story a title' : 'Title is too long (max 200)';
    }
    return 'Write something before publishing';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, content } = this.form.getRawValue();
    const id = this.id();
    this.submitting.set(true);
    this.formError.set(null);

    const request = id
      ? this.storiesApi.update(id, { title: title.trim(), content })
      : this.storiesApi.create(title.trim(), content);

    request.subscribe({
      next: (story) => {
        this.submitting.set(false);
        this.toast.success(id ? 'Story updated.' : 'Story published.');
        void this.router.navigate(['/stories', story.id]);
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        if (apiErrorStatus(error) === 403) {
          this.formError.set('You can only edit your own stories.');
          return;
        }
        this.formError.set(apiErrorMessage(error, 'Could not save the story.'));
      },
    });
  }

  protected cancel(): void {
    const id = this.id();
    void this.router.navigateByUrl(id ? `/stories/${id}` : '/');
  }
}
