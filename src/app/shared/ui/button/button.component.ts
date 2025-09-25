import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [NgClass],
  template: `<button
    [attr.type]="type"
    [disabled]="disabled"
    [ngClass]="['btn', variant, disabled ? 'is-disabled' : '']"
  >
    <ng-content />
  </button>`,
  styles: [
    `
      @use '../../styles/tokens' as *;

      .btn {
        appearance: none;
        border: 1px solid rgba(255, 255, 255, 0.04);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(0, 0, 0, 0.05));
        color: var(--text);
        padding: 8px 12px;
        border-radius: $radius-md;
        font-weight: 700;
        cursor: pointer;
        box-shadow: $shadow-soft;
        transition: transform 0.06s ease, box-shadow 0.12s ease, background 0.12s ease;
      }
      .btn:hover {
        transform: translateY(-2px);
        box-shadow: $shadow-glow;
      }
      .btn.primary {
        background: linear-gradient(90deg, rgba(46, 242, 123, 0.06), rgba(126, 231, 255, 0.02));
        color: var(--accent);
        border-color: rgba(46, 242, 123, 0.14);
      }
      .btn.ghost {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.03);
        color: var(--muted);
      }
      .btn.outline {
        background: transparent;
        border: 1px dashed rgba(255, 255, 255, 0.03);
        color: var(--text);
      }
      .btn:disabled {
        opacity: 0.35;
        transform: none;
        cursor: not-allowed;
      }

      .ghost {
        background: transparent;
        color: $color-text;
        border-color: $color-border;
      }
      .outline {
        background: $color-surface;
        color: $color-text;
        border-color: $color-text;
      }
    `,
  ],
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'ghost' | 'outline' = 'primary';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
}
