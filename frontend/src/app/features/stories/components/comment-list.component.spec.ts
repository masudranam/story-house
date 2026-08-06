import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../../core/auth/auth-store';
import { Comment, Page, Role } from '../../../core/models/api.models';
import { CommentListComponent } from './comment-list.component';

const alice = { id: 'u1', name: 'Alice', username: 'alice' };
const bob = { id: 'u2', name: 'Bob', username: 'bob' };

const comments: Page<Comment> = {
  data: [
    {
      id: 'c1',
      content: 'Alice comment',
      storyId: 's1',
      author: alice,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    },
    {
      id: 'c2',
      content: 'Bob comment',
      storyId: 's1',
      author: bob,
      createdAt: '2026-03-02T00:00:00.000Z',
      updatedAt: '2026-03-03T00:00:00.000Z',
    },
  ],
  meta: { page: 1, limit: 10, totalItems: 2, totalPages: 1 },
};

function sessionFor(id: string, role: Role = 'USER') {
  return {
    accessToken: 'access-1',
    refreshToken: 'refresh-1',
    user: {
      id,
      name: id === 'u1' ? 'Alice' : 'Bob',
      username: id === 'u1' ? 'alice' : 'bob',
      email: `${id}@storyhouse.local`,
      role,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  };
}

describe('CommentListComponent', () => {
  let fixture: ComponentFixture<CommentListComponent>;
  let backend: HttpTestingController;
  let store: AuthStore;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CommentListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(CommentListComponent);
    backend = TestBed.inject(HttpTestingController);
    store = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    flushComments();
    backend.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;

  function flushComments(body: Page<Comment> = comments): number {
    const requests = backend.match((req) => req.url.includes('/comments') && req.method === 'GET');
    requests.forEach((req) => req.flush(body));
    return requests.length;
  }

  async function signIn(id: string, role: Role = 'USER'): Promise<void> {
    const promise = firstValueFrom(store.login('x', 'Password123!', true));
    backend.expectOne('/api/v1/auth/login').flush(sessionFor(id, role));
    await promise;
  }

  async function load(): Promise<void> {
    fixture.componentRef.setInput('storyId', 's1');
    fixture.detectChanges();
    flushComments();
    await fixture.whenStable();
  }

  it('lists comments and marks edited ones', async () => {
    await load();

    expect(el().textContent).toContain('Alice comment');
    expect(el().textContent).toContain('Bob comment');
    // c2 has updatedAt !== createdAt.
    expect(el().textContent).toContain('(edited)');
  });

  it('invites anonymous readers to log in instead of showing a composer', async () => {
    await load();

    expect(el().querySelector('#new-comment')).toBeNull();
    expect(el().textContent).toContain('to join the conversation');
  });

  it('shows inline validation instead of silently ignoring an empty comment', async () => {
    await signIn('u1');
    await load();

    const submit = Array.from(el().querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Post comment'),
    );
    submit?.click();
    await fixture.whenStable();

    expect(el().querySelector('[role="alert"]')?.textContent).toContain('Write something');
    expect(el().querySelector('#new-comment')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('posts a comment and reloads the list', async () => {
    await signIn('u1');
    await load();

    fixture.componentInstance['newComment'].setValue({ content: 'Nice one' });
    await fixture.whenStable();
    Array.from(el().querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Post comment'))
      ?.click();

    const post = backend.expectOne(
      (r) => r.method === 'POST' && r.url === '/api/v1/stories/s1/comments',
    );
    expect(post.request.body).toEqual({ content: 'Nice one' });
    post.flush(comments.data[0]);
    fixture.detectChanges();

    expect(flushComments()).toBeGreaterThan(0);
  });

  it('offers edit only on your own comment, delete on your own', async () => {
    await signIn('u1');
    await load();

    const rows = Array.from(el().querySelectorAll('li'));
    const aliceRow = rows.find((r) => r.textContent?.includes('Alice comment'));
    const bobRow = rows.find((r) => r.textContent?.includes('Bob comment'));

    expect(aliceRow?.textContent).toContain('Edit');
    expect(aliceRow?.textContent).toContain('Delete');
    expect(bobRow?.textContent).not.toContain('Edit');
    expect(bobRow?.textContent).not.toContain('Delete');
  });

  it("lets an admin delete anyone's comment but never edit it", async () => {
    await signIn('u1', 'ADMIN');
    await load();

    const bobRow = Array.from(el().querySelectorAll('li')).find((r) =>
      r.textContent?.includes('Bob comment'),
    );
    expect(bobRow?.textContent).toContain('Delete');
    expect(bobRow?.textContent).not.toContain('Edit');
  });

  it('edits a comment inline via PATCH', async () => {
    await signIn('u1');
    await load();

    const aliceRow = Array.from(el().querySelectorAll('li')).find((r) =>
      r.textContent?.includes('Alice comment'),
    );
    Array.from(aliceRow?.querySelectorAll('button') ?? [])
      .find((b) => b.textContent?.includes('Edit'))
      ?.click();
    await fixture.whenStable();

    fixture.componentInstance['editForm'].setValue({ content: 'Alice comment (edited)' });
    await fixture.whenStable();
    Array.from(el().querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === 'Save')
      ?.click();

    const patch = backend.expectOne('/api/v1/comments/c1');
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ content: 'Alice comment (edited)' });
    patch.flush({ ...comments.data[0], content: 'Alice comment (edited)' });
    fixture.detectChanges();
    flushComments();
    await fixture.whenStable();
  });

  it('deletes a comment behind a confirm dialog', async () => {
    await signIn('u1');
    await load();

    const aliceRow = Array.from(el().querySelectorAll('li')).find((r) =>
      r.textContent?.includes('Alice comment'),
    );
    Array.from(aliceRow?.querySelectorAll('button') ?? [])
      .find((b) => b.textContent?.includes('Delete'))
      ?.click();
    await fixture.whenStable();

    expect(el().querySelector('[role="dialog"]')).not.toBeNull();
    Array.from(el().querySelectorAll<HTMLButtonElement>('[role="dialog"] button'))
      .find((b) => b.textContent?.trim() === 'Delete')
      ?.click();

    backend.expectOne({ method: 'DELETE', url: '/api/v1/comments/c1' }).flush(null);
    fixture.detectChanges();
    expect(flushComments()).toBeGreaterThan(0);
  });
});
