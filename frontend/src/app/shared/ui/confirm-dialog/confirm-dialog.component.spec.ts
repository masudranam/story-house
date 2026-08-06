import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConfirmDialogComponent],
  template: `
    @if (open()) {
      <app-confirm-dialog
        title="Delete story?"
        message="This cannot be undone."
        (confirmed)="confirmedCount = confirmedCount + 1"
        (cancelled)="cancelledCount = cancelledCount + 1"
      />
    }
  `,
})
class HostComponent {
  readonly open = signal(true);
  confirmedCount = 0;
  cancelledCount = 0;
}

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  const dialog = (): HTMLElement =>
    fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;

  it('renders accessible dialog semantics and the message', () => {
    const el = dialog();
    expect(el.getAttribute('aria-modal')).toBe('true');
    expect(el.getAttribute('aria-labelledby')).toBeTruthy();
    // The label id must actually resolve to the heading.
    const labelId = el.getAttribute('aria-labelledby') as string;
    expect(el.querySelector(`#${labelId}`)?.textContent).toContain('Delete story?');
    expect(el.textContent).toContain('This cannot be undone.');
  });

  it('moves focus into the dialog when it opens', () => {
    expect(document.activeElement).toBe(dialog());
  });

  it('Escape cancels', async () => {
    dialog().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(host.cancelledCount).toBe(1);
    expect(host.confirmedCount).toBe(0);
  });

  it('emits confirmed from the danger button and cancelled from the ghost button', async () => {
    const buttons = Array.from(dialog().querySelectorAll<HTMLButtonElement>('button'));
    const confirm = buttons.find((b) => b.textContent?.includes('Delete'));
    const cancel = buttons.find((b) => b.textContent?.includes('Cancel'));

    confirm?.click();
    cancel?.click();
    await fixture.whenStable();

    expect(host.confirmedCount).toBe(1);
    expect(host.cancelledCount).toBe(1);
  });

  it('traps Tab focus inside the dialog', async () => {
    const buttons = Array.from(dialog().querySelectorAll<HTMLButtonElement>('button'));
    const last = buttons[buttons.length - 1];
    last.focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    dialog().dispatchEvent(event);
    await fixture.whenStable();

    // Focus wrapped back to the first button rather than escaping the dialog.
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(buttons[0]);
  });
});
