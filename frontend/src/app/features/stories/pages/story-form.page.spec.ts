import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Story } from '../../../core/models/api.models';
import { StoryFormPage } from './story-form.page';

const story: Story = {
  id: 's1',
  title: 'Story One',
  content: 'Body one.',
  author: { id: 'u1', name: 'Alice', username: 'alice' },
  likesCount: 0,
  commentsCount: 0,
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
};

describe('StoryFormPage', () => {
  let fixture: ComponentFixture<StoryFormPage>;
  let backend: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryFormPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(StoryFormPage);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
  });

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const titleInput = () => el().querySelector('#title') as HTMLInputElement | null;
  const submitButton = () =>
    Array.from(el().querySelectorAll('button')).find((b) => b.type === 'submit');

  describe('create mode', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('renders an empty form with a Publish action and fetches nothing', () => {
      expect(el().querySelector('h1')?.textContent).toContain('Write a story');
      expect(titleInput()?.value).toBe('');
      expect(submitButton()?.textContent).toContain('Publish');
    });

    it('blocks an empty submit and shows field errors', async () => {
      submitButton()?.click();
      await fixture.whenStable();

      expect(el().textContent).toContain('Give your story a title');
      expect(el().textContent).toContain('Write something before publishing');
    });

    it('POSTs and navigates to the new story', async () => {
      const router = TestBed.inject(Router);
      const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      fixture.componentInstance['form'].setValue({ title: 'New', content: 'Fresh' });
      await fixture.whenStable();

      submitButton()?.click();
      const req = backend.expectOne('/api/v1/stories');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ title: 'New', content: 'Fresh' });
      req.flush({ ...story, id: 's9' });
      await fixture.whenStable();

      expect(navigate).toHaveBeenCalledWith(['/stories', 's9']);
    });
  });

  describe('edit mode', () => {
    it('shows a skeleton (never an empty form) while prefill is in flight', async () => {
      fixture.componentRef.setInput('id', 's1');
      fixture.detectChanges();

      // The form must NOT be rendered yet — a late response would clobber typing.
      expect(titleInput()).toBeNull();
      expect(el().querySelector('app-skeleton')).not.toBeNull();

      backend.expectOne('/api/v1/stories/s1').flush(story);
      await fixture.whenStable();

      expect(titleInput()?.value).toBe('Story One');
    });

    it('PATCHes the story being edited', async () => {
      const router = TestBed.inject(Router);
      const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      fixture.componentRef.setInput('id', 's1');
      fixture.detectChanges();
      backend.expectOne('/api/v1/stories/s1').flush(story);
      await fixture.whenStable();

      fixture.componentInstance['form'].setValue({ title: 'Edited', content: 'Body one.' });
      await fixture.whenStable();
      submitButton()?.click();

      const req = backend.expectOne('/api/v1/stories/s1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ title: 'Edited', content: 'Body one.' });
      req.flush({ ...story, title: 'Edited' });
      await fixture.whenStable();

      expect(navigate).toHaveBeenCalledWith(['/stories', 's1']);
    });

    it('reloads when the route id changes, so story B never gets story A body', async () => {
      fixture.componentRef.setInput('id', 's1');
      fixture.detectChanges();
      backend.expectOne('/api/v1/stories/s1').flush(story);
      await fixture.whenStable();
      expect(titleInput()?.value).toBe('Story One');

      // Navigate edit(A) → edit(B) with the component reused.
      fixture.componentRef.setInput('id', 's2');
      fixture.detectChanges();
      backend
        .expectOne('/api/v1/stories/s2')
        .flush({ ...story, id: 's2', title: 'Story Two', content: 'Body two.' });
      await fixture.whenStable();

      expect(titleInput()?.value).toBe('Story Two');
    });

    it('surfaces a 403 from the API inline', async () => {
      fixture.componentRef.setInput('id', 's1');
      fixture.detectChanges();
      backend.expectOne('/api/v1/stories/s1').flush(story);
      await fixture.whenStable();

      submitButton()?.click();
      backend
        .expectOne('/api/v1/stories/s1')
        .flush(
          { statusCode: 403, message: 'Forbidden', error: 'Forbidden' },
          { status: 403, statusText: 'Forbidden' },
        );
      await fixture.whenStable();

      expect(el().querySelector('[role="alert"]')?.textContent).toContain(
        'only edit your own stories',
      );
    });
  });
});
