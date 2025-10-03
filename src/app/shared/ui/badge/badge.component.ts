import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [NgClass],
  template: `<span class="badge" [ngClass]="variant"><ng-content /></span>`,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        background: var(--panel);
        border: 1px solid var(--glass);
        color: var(--accent-2);
        padding: 5px 12px;
        border-radius: 999px;
        font-weight: 700;
        font-size: 12px;
        line-height: 1.2;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .badge.success {
        background: rgba(46, 242, 123, 0.1);
        color: var(--accent);
        border-color: rgba(46, 242, 123, 0.2);
      }
      .badge.danger {
        background: rgba(255, 107, 107, 0.1);
        color: #ffb3b3;
        border-color: rgba(255, 107, 107, 0.2);
      }
    `,
  ],
})
export class BadgeComponent {
  @Input() variant: 'success' | 'danger' | '' = '';
}
