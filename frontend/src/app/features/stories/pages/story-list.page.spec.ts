import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../../core/auth/auth-store';
import { Page, Role, Story } from '../../../core/models/api.models';
import { StoryListPage } from './story-list.page';

const alice = { id: 'u1', name: 'Alice', username: 'alice' };
const bob = { id: 'u2', name: 'Bob', username: 'bob' };

const page: Page<Story> = {
  data: [
    {
      id: 's1',
      title: 'Alice Story',
      content: 'By Alice.',
      author: alice,
      likesCount: 2,
      commentsCount: 1,
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    },
    {
      id: 's2',
      title: 'Bob Story',
      content: 'By Bob.',
      author: bob,
      likesCount: 0,
      commentsCount: 0,
      createdAt: '2026-02-02T00:00:00.000Z',
      updatedAt: '2026-02-02T00:00:00.000Z',
    },
  ],
  meta: { page: 1, limit: 9, totalItems: 2, totalPages: 1 },
};

function sessionFor(id: string, role: Role = 'USER') {
  return {
    accessToken: 'access-1',
    refreshToken: 'refresh-1',
    user: {
      id,
      name: 'Tester',
      username: 'tester',
      email: 'tester@storyhouse.local',
      role,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  };
}

describe('StoryListPage', () => {
  let fixture: ComponentFixture<StoryListPage>;
  let backend: HttpTestingController;
  let store: AuthStore;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [StoryListPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(StoryListPage);
    backend = TestBed.inject(HttpTestingController);
    store = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    flushStories();
    backend.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;

  function flushStories(body: Page<Story> = page): number {
    const requests = backend.match((req) => req.url === '/api/v1/stories');
    requests.forEach((req) => req.flush(body));
    return requests.length;
  }

  async function signIn(id: string, role: Role = 'USER'): Promise<void> {
    const promise = firstValueFrom(store.login('tester', 'Password123!', true));
    backend.expectOne('/api/v1/auth/login').flush(sessionFor(id, role));
    await promise;
  }

  async function load(body: Page<Story> = page): Promise<void> {
    fixture.detectChanges();
    flushStories(body);
    await fixture.whenStable();
  }

  it('requests the first page with the feed page size', async () => {
    fixture.detectChanges();
    const req = backend.expectOne((r) => r.url === '/api/v1/stories');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('9');
    expect(req.request.params.get('sort')).toBe('createdAt:desc');
    req.flush(page);
    await fixture.whenStable();

    expect(el().textContent).toContain('Alice Story');
    expect(el().textContent).toContain('Bob Story');
  });

  it('shows an empty state with a CTA for signed-in users', async () => {
    await signIn('u1');
    await load({ data: [], meta: { page: 1, limit: 9, totalItems: 0, totalPages: 1 } });

    expect(el().textContent).toContain('No stories yet');
    expect(el().textContent).toContain('Write the first story');
  });

  it('hides the write CTA from anonymous visitors', async () => {
    await load({ data: [], meta: { page: 1, limit: 9, totalItems: 0, totalPages: 1 } });

    expect(el().textContent).toContain('No stories yet');
    expect(el().textContent).not.toContain('Write the first story');
  });

  it('re-requests with the chosen sort order', async () => {
    await load();

    fixture.componentInstance['setSort']('createdAt:asc');
    fixture.detectChanges();

    const sorted = backend.match(
      (r) => r.url === '/api/v1/stories' && r.params.get('sort') === 'createdAt:asc',
    );
    expect(sorted.length).toBe(1);
    sorted[0].flush(page);
    await fixture.whenStable();
  });

  it('offers edit+delete on your own story, nothing on someone else’s', async () => {
    await signIn('u1');
    await load();

    const cards = Array.from(el().querySelectorAll('app-story-card'));
    const aliceCard = cards.find((c) => c.textContent?.includes('Alice Story'));
    const bobCard = cards.find((c) => c.textContent?.includes('Bob Story'));

    expect(aliceCard?.textContent).toContain('Edit');
    expect(aliceCard?.textContent).toContain('Delete');
    expect(bobCard?.textContent).not.toContain('Edit');
    expect(bobCard?.textContent).not.toContain('Delete');
  });

  it('gives an admin delete (moderation) but not edit on another user’s story', async () => {
    await signIn('u1', 'ADMIN');
    await load();

    const bobCard = Array.from(el().querySelectorAll('app-story-card')).find((c) =>
      c.textContent?.includes('Bob Story'),
    );
    expect(bobCard?.textContent).toContain('Delete');
    expect(bobCard?.textContent).not.toContain('Edit');
  });

  it('deletes behind a confirm dialog and reloads', async () => {
    await signIn('u1');
    await load();

    const aliceCard = Array.from(el().querySelectorAll('app-story-card')).find((c) =>
      c.textContent?.includes('Alice Story'),
    );
    Array.from(aliceCard?.querySelectorAll('button') ?? [])
      .find((b) => b.textContent?.includes('Delete'))
      ?.click();
    await fixture.whenStable();

    const dialog = el().querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('Alice Story');

    Array.from(el().querySelectorAll<HTMLButtonElement>('[role="dialog"] button'))
      .find((b) => b.textContent?.trim() === 'Delete')
      ?.click();

    backend.expectOne({ method: 'DELETE', url: '/api/v1/stories/s1' }).flush(null);
    fixture.detectChanges();
    expect(flushStories()).toBeGreaterThan(0);
  });

  it('renders a retry affordance when the feed fails to load', async () => {
    fixture.detectChanges();
    backend
      .expectOne((r) => r.url === '/api/v1/stories')
      .flush(
        { statusCode: 500, message: 'Internal server error', error: 'Internal Server Error' },
        { status: 500, statusText: 'Internal Server Error' },
      );
    await fixture.whenStable();

    expect(el().textContent).toContain("Couldn't load stories");
    expect(el().textContent).toContain('Retry');
  });
});
