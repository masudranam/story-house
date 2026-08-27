import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Story } from '../../../core/models/api.models';
import { StoryCardComponent } from './story-card.component';

const story: Story = {
  id: 's1',
  title: 'The Lighthouse',
  content: 'x'.repeat(250),
  author: { id: 'u1', name: 'Alice Rahman', username: 'alice' },
  likesCount: 1,
  commentsCount: 2,
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
};

describe('StoryCardComponent', () => {
  let fixture: ComponentFixture<StoryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(StoryCardComponent);
    fixture.componentRef.setInput('story', story);
    await fixture.whenStable();
  });

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;

  it('truncates long content into an excerpt', () => {
    const text = el().textContent ?? '';
    expect(text).toContain('…');
    expect(text).not.toContain('x'.repeat(200));
  });

  it('uses singular/plural labels correctly', () => {
    expect(el().textContent).toContain('1 like');
    expect(el().textContent).toContain('2 comments');
  });

  it('hides owner actions by default', () => {
    expect(el().textContent).not.toContain('Edit');
    expect(el().textContent).not.toContain('Delete');
  });

  it('emits edit and delete requests when the actions are enabled', async () => {
    fixture.componentRef.setInput('canEdit', true);
    fixture.componentRef.setInput('canDelete', true);
    await fixture.whenStable();

    const edits: Story[] = [];
    const deletes: Story[] = [];
    fixture.componentInstance.editRequested.subscribe((s) => edits.push(s));
    fixture.componentInstance.deleteRequested.subscribe((s) => deletes.push(s));

    const buttons = Array.from(el().querySelectorAll('button'));
    buttons.find((b) => b.textContent?.includes('Edit'))?.click();
    buttons.find((b) => b.textContent?.includes('Delete'))?.click();
    await fixture.whenStable();

    expect(edits).toEqual([story]);
    expect(deletes).toEqual([story]);
  });

  it('labels icon-free action buttons with the story title for screen readers', async () => {
    fixture.componentRef.setInput('canDelete', true);
    await fixture.whenStable();

    const del = Array.from(el().querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Delete'),
    );
    expect(del?.getAttribute('aria-label')).toBe('Delete The Lighthouse');
  });
});
