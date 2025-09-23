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
        background: $color-surface;
        border: 1px solid $color-border;
        border-radius: $radius-md;
        padding: 16px;
      }
      .card + .card {
        margin-top: 16px;
      }
      .card-hd {
        margin-bottom: 12px;
      }
      .ttl {
        margin: 0 0 6px 0;
        font-size: 18px;
      }
      .sub {
        margin: 0;
        color: $color-muted;
      }
      .card-body {
        display: grid;
        gap: 12px;
      }
      .card-ft {
        margin-top: 10px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class ToolCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() hasActions = false;
}
