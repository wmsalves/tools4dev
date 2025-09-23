import { Component, inject } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'toast-container',
  standalone: true,
  imports: [NgFor, NgClass],
  template: `
    <div class="toast-wrap">
      <div
        class="toast"
        *ngFor="let t of toastSvc.toasts()"
        [ngClass]="t.type"
        (click)="toastSvc.dismiss(t.id)"
        role="status"
        aria-live="polite"
      >
        <div class="dot"></div>
        <div class="msg">{{ t.message }}</div>
        <button
          class="x"
          aria-label="Dismiss"
          (click)="toastSvc.dismiss(t.id); $event.stopPropagation()"
        >
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .toast-wrap {
        position: fixed;
        top: 16px;
        right: 16px;
        display: grid;
        gap: 8px;
        z-index: 1000;
        pointer-events: none;
      }
      .toast {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 10px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        color: #0f172a;
        border-radius: 12px;
        padding: 10px 12px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        pointer-events: auto;
        cursor: pointer;
        min-width: 220px;
        max-width: 420px;
        transition: transform 0.12s ease, opacity 0.12s ease;
      }
      .toast:hover {
        transform: translateY(-1px);
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: #0ea5e9;
      }
      .msg {
        font-size: 14px;
      }
      .x {
        appearance: none;
        border: none;
        background: transparent;
        font-size: 14px;
        cursor: pointer;
        color: #64748b;
      }
      .success {
        border-color: #16a34a;
        background: #ecfdf5;
        color: #166534;
      }
      .success .dot {
        background: #22c55e;
      }
      .error {
        border-color: #dc2626;
        background: #fef2f2;
        color: #7f1d1d;
      }
      .error .dot {
        background: #ef4444;
      }
      .info {
        border-color: #38bdf8;
        background: #eff6ff;
        color: #1e3a8a;
      }
      .info .dot {
        background: #0ea5e9;
      }
    `,
  ],
})
export class ToastContainerComponent {
  toastSvc = inject(ToastService);
}
