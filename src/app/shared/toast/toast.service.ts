import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  duration: number; // ms
}

let __id = 0;

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<ToastItem[]>([]);

  show(type: ToastType, message: string, duration = 2500) {
    const id = ++__id;
    const item: ToastItem = { id, type, message, duration };
    this.toasts.update((list) => [item, ...list]);

    // auto-dismiss
    window.setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string, duration = 2000) {
    this.show('success', message, duration);
  }

  error(message: string, duration = 3000) {
    this.show('error', message, duration);
  }

  info(message: string, duration = 2500) {
    this.show('info', message, duration);
  }

  dismiss(id: number) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clearAll() {
    this.toasts.set([]);
  }
}
