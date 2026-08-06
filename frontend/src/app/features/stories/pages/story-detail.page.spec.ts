import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../../core/auth/auth-store';
import { Story } from '../../../core/models/api.models';
import { StoryDetailPage } from './story-detail.page';

const author = { id: 'u1', name: 'Alice Rahman', username: 'alice' };

const story: Story = {
  id: 's1',
  title: 'The Lighthouse',
  content: 'Everyone said it had been dark for forty years.',
  author,
  likesCount: 3,
  commentsCount: 0,
  likedByMe: false,
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
};

const session = {
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  user: {
    id: 'u2',
    name: 'Bob Hasan',
    username: 'bob',
    email: 'bob@storyhouse.local',
    role: 'USER' as const,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
};

describe('StoryDetailPage', () => {
  let fixture: ComponentFixture<StoryDetailPage>;
  let backend: HttpTestingController;
  let store: AuthStore;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [StoryDetailPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(StoryDetailPage);
    backend = TestBed.inject(HttpTestingController);
    store = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    backend.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;

  async function signIn(): Promise<void> {
    const promise = firstValueFrom(store.login('bob', 'Password123!', true));
    backend.expectOne('/api/v1/auth/login').flush(session);
    await promise;
  }

  async function loadStory(overrides: Partial<Story> = {}): Promise<void> {
    fixture.componentRef.setInput('id', 's1');
    // detectChanges (not whenStable) starts the resource: whenStable would
    // block on the very request this helper is about to flush.
    fixture.detectChanges();
    backend.expectOne('/api/v1/stories/s1').flush({ ...story, ...overrides });
    await fixture.whenStable();
  }

  it('renders the story with its author and like count', async () => {
    await loadStory();

    expect(el().querySelector('h1')?.textContent).toContain('The Lighthouse');
    expect(el().textContent).toContain('Alice Rahman');
    expect(el().textContent).toContain('3 likes');
  });

  it('never displays an author email (the API does not send one)', async () => {
    await loadStory();
    expect(el().textContent).not.toContain('@');
  });

  it('disables the like button for anonymous readers', async () => {
    await loadStory();
    const likeButton = el().querySelector('app-like-button button') as HTMLButtonElement;
    expect(likeButton.disabled).toBe(true);
  });

  it('optimistically increments the like count, then confirms with the server', async () => {
    await signIn();
    await loadStory();
    const likeButton = () => el().querySelector('app-like-button button') as HTMLButtonElement;

    likeButton().click();
    await fixture.whenStable();

    // Painted before the response arrives.
    expect(el().textContent).toContain('4 likes');
    expect(likeButton().getAttribute('aria-pressed')).toBe('true');

    backend.expectOne({ method: 'PUT', url: '/api/v1/stories/s1/like' }).flush(null);
    await fixture.whenStable();
    expect(el().textContent).toContain('4 likes');
  });

  it('rolls the optimistic like back when the request fails', async () => {
    await signIn();
    await loadStory();
    const likeButton = () => el().querySelector('app-like-button button') as HTMLButtonElement;

    likeButton().click();
    await fixture.whenStable();
    expect(el().textContent).toContain('4 likes');

    backend
      .expectOne({ method: 'PUT', url: '/api/v1/stories/s1/like' })
      .flush(
        { statusCode: 500, message: 'Internal server error', error: 'Internal Server Error' },
        { status: 500, statusText: 'Internal Server Error' },
      );
    await fixture.whenStable();

    expect(el().textContent).toContain('3 likes');
    expect(likeButton().getAttribute('aria-pressed')).toBe('false');
  });

  it('unlikes with DELETE when already liked', async () => {
    await signIn();
    await loadStory({ likedByMe: true, likesCount: 5 });

    (el().querySelector('app-like-button button') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(el().textContent).toContain('4 likes');
    backend.expectOne({ method: 'DELETE', url: '/api/v1/stories/s1/like' }).flush(null);
  });

  it('hides edit/delete from a non-owner, shows delete to an admin', async () => {
    await signIn();
    await loadStory();
    expect(el().textContent).not.toContain('Edit');
    expect(el().textContent).not.toContain('Delete');

    store.setUser({ ...session.user, role: 'ADMIN' });
    await fixture.whenStable();
    expect(el().textContent).toContain('Delete');
    // Admins may moderate (delete) but not edit — matches the contract.
    expect(el().textContent).not.toContain('Edit');
  });

  it('shows a not-found state when the story is missing', async () => {
    fixture.componentRef.setInput('id', 'gone');
    fixture.detectChanges();
    backend
      .expectOne('/api/v1/stories/gone')
      .flush(
        { statusCode: 404, message: 'Story not found', error: 'Not Found' },
        { status: 404, statusText: 'Not Found' },
      );
    await fixture.whenStable();

    expect(el().textContent).toContain('Story not found');
  });
});
