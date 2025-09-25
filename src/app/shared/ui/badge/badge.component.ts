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
        background: rgba(0, 0, 0, 0.28);
        border: 1px solid rgba(255, 255, 255, 0.03);
        color: var(--accent-2);
        padding: 6px 10px;
        border-radius: 999px;
        font-weight: 700;
      }
      .badge.success {
        background: rgba(46, 242, 123, 0.08);
        color: var(--accent);
        border-color: rgba(46, 242, 123, 0.12);
      }
      .badge.danger {
        background: rgba(255, 107, 107, 0.06);
        color: #ffb3b3;
        border-color: rgba(255, 107, 107, 0.12);
      }
    `,
  ],
})
export class BadgeComponent {
  @Input() variant: 'success' | 'danger' | '' = '';
}
