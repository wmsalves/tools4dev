import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [NgClass],
  template: `<span class="badge" [ngClass]="variant"><ng-content /></span>`,
  styles: [
    `
      @use '../../styles/tokens' as *;

      .badge {
        display: inline-block;
        border-radius: $radius-full;
        padding: 6px 10px;
        font-weight: 700;
        font-size: 12px;
        border: 1px solid $color-border;
        background: #f3f4f6;
        color: $color-text;
      }
      .success {
        border-color: $color-success-border;
        background: $color-success-bg;
        color: $color-success;
      }
      .danger {
        border-color: $color-danger-border;
        background: $color-danger-bg;
        color: $color-danger;
      }
    `,
  ],
})
export class BadgeComponent {
  @Input() variant: 'success' | 'danger' | '' = '';
}
