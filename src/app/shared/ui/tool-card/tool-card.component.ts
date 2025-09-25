import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'tool-card',
  standalone: true,
  imports: [NgIf],
  template: `
    <section class="card">
      <header class="card-hd" *ngIf="title || subtitle">
        <h2 class="ttl">{{ title }}</h2>
        <p class="sub" *ngIf="subtitle">{{ subtitle }}</p>
      </header>
      <div class="card-body"><ng-content /></div>
      <footer class="card-ft" *ngIf="hasActions"><ng-content select="[actions]" /></footer>
    </section>
  `,
  styles: [
    `
      @use '../../styles/tokens' as *;

      .card {
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.01), rgba(0, 0, 0, 0.03));
        border: 1px solid rgba(255, 255, 255, 0.03);
        border-radius: $radius-md;
        padding: 16px;
        box-shadow: $shadow-soft;
      }
      .card-hd .ttl {
        color: var(--accent);
      }
      .card .sub {
        color: var(--muted);
      }
    `,
  ],
})
export class ToolCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() hasActions = false;
}
