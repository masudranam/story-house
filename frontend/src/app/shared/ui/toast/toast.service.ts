import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  kind: 'success' | 'error';
  text: string;
}

const AUTO_DISMISS_MS = 4500;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(text: string): void {
    this.push('success', text);
  }

  error(text: string): void {
    this.push('error', text);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((toast) => toast.id !== id));
  }

  private push(kind: ToastMessage['kind'], text: string): void {
    const id = this.nextId++;
    this._toasts.update((list) => [...list, { id, kind, text }]);
    setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS);
  }
}
