import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginatorComponent } from './paginator.component';

describe('PaginatorComponent', () => {
  let fixture: ComponentFixture<PaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PaginatorComponent] }).compileComponents();
    fixture = TestBed.createComponent(PaginatorComponent);
  });

  async function render(page: number, totalPages: number): Promise<void> {
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('totalPages', totalPages);
    await fixture.whenStable();
  }

  const buttons = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('button'));

  it('renders nothing for a single page', async () => {
    await render(1, 1);
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });

  it('shows the current position', async () => {
    await render(2, 5);
    expect(fixture.nativeElement.textContent).toContain('Page 2 of 5');
  });

  it('disables Previous on the first page and Next on the last', async () => {
    await render(1, 3);
    expect(buttons()[0].disabled).toBe(true);
    expect(buttons()[1].disabled).toBe(false);

    await render(3, 3);
    expect(buttons()[0].disabled).toBe(false);
    expect(buttons()[1].disabled).toBe(true);
  });

  it('emits the target page number', async () => {
    await render(2, 5);
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => emitted.push(page));

    buttons()[0].click();
    buttons()[1].click();
    await fixture.whenStable();

    expect(emitted).toEqual([1, 3]);
  });
});
