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
      :host {
        display: block;
        height: 100%;
      }

      .card {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--panel);
        border: 1px solid var(--card-border-color, rgba(255, 255, 255, 0.05));
        border-radius: var(--radius-md);
        padding: 24px;
        box-shadow: 0 8px 30px rgba(2, 6, 23, 0.4);
        transition: border-color 0.2s ease-out;
      }

      .card-hd .ttl {
        color: var(--accent);
        font-size: 1.25rem;
        font-weight: 700;
      }
      .card-hd .sub {
        margin-top: 4px;
        color: var(--muted);
        line-height: 1.5;
        font-size: 0.95rem;
      }
      .card-body {
        padding-top: 16px;
        flex-grow: 1;
      }
      .card-ft {
        margin-top: auto;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }
    `,
  ],
})
export class ToolCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() hasActions = false;
}
