import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

type BtnVariant = 'primary' | 'outline' | 'ghost' | 'success' | 'danger' | 'subtle';
type BtnSize = 'sm' | 'md';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      [attr.type]="type"
      class="btn"
      [ngClass]="['v-' + variant, 's-' + size, block ? 'block' : '']"
      [disabled]="disabled"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      .btn {
        appearance: none;
        border: 1px solid rgba(255, 255, 255, 0.06);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(0, 0, 0, 0.05));
        color: var(--text);
        border-radius: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.06s ease, box-shadow 0.12s ease, border-color 0.12s ease,
          background 0.12s ease, opacity 0.12s ease;
        box-shadow: 0 6px 26px rgba(2, 6, 23, 0.4);
        user-select: none;
      }
      .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 30px rgba(2, 6, 23, 0.5);
      }
      .btn:active {
        transform: translateY(0);
      }

      /* sizes */
      .s-sm {
        padding: 6px 10px;
        font-size: 12px;
      }
      .s-md {
        padding: 8px 12px;
        font-size: 14px;
      }

      .block {
        width: 100%;
      }

      /* variants */
      .v-primary {
        color: var(--accent);
        border-color: rgba(46, 242, 123, 0.18);
        background: linear-gradient(90deg, rgba(46, 242, 123, 0.08), rgba(126, 231, 255, 0.03));
      }
      .v-primary:hover {
        border-color: rgba(46, 242, 123, 0.28);
      }

      .v-outline {
        background: transparent;
        border-style: dashed;
        border-color: rgba(255, 255, 255, 0.09);
        color: var(--text);
      }
      .v-outline:hover {
        border-color: rgba(46, 242, 123, 0.28);
      }

      .v-ghost {
        background: transparent;
        border-color: rgba(255, 255, 255, 0.05);
        color: var(--muted);
      }
      .v-ghost:hover {
        color: var(--text);
        border-color: rgba(46, 242, 123, 0.22);
      }

      .v-success {
        color: var(--accent);
        border-color: rgba(46, 242, 123, 0.22);
        background: rgba(46, 242, 123, 0.08);
      }
      .v-danger {
        color: #ffb3b3;
        border-color: rgba(255, 107, 107, 0.24);
        background: rgba(255, 107, 107, 0.08);
      }
      .v-subtle {
        color: var(--text);
        border-color: rgba(255, 255, 255, 0.05);
        background: rgba(0, 0, 0, 0.18);
      }

      /* disabled */
      .btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
        filter: grayscale(0.2);
      }
    `,
  ],
})
export class ButtonComponent {
  @Input() variant: BtnVariant = 'primary';
  @Input() size: BtnSize = 'md';
  @Input() block = false;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' = 'button';
}
