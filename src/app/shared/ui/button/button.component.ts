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
        border: 1px solid $color-primary;
        background: $color-primary;
        color: $color-primary-contrast;
        padding: 8px 12px;
        border-radius: $radius-md;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.06s ease, box-shadow 0.06s ease, opacity 0.2s ease;
      }
      .btn:hover {
        transform: translateY(-1px);
        box-shadow: $shadow-card;
      }
      .btn.is-disabled,
      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: none;
        transform: none;
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
