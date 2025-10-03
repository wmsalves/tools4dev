import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

type BtnVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger' | 'subtle';
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
        /* --- Base --- */
        appearance: none;
        border: 1px solid rgba(255, 255, 255, 0.06);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(0, 0, 0, 0.05));
        color: var(--text);
        border-radius: 12px;
        font-weight: 700;
        cursor: pointer;
        user-select: none;
        line-height: 1;
        outline: none; /* Remove o outline padrão para customizar o foco */

        /* --- Transições Suaves --- */
        transition: transform 0.1s ease, box-shadow 0.15s ease, border-color 0.15s ease,
          background 0.15s ease, opacity 0.15s ease, color 0.15s ease;

        box-shadow: 0 4px 12px rgba(2, 6, 23, 0.4);
      }

      /* --- Feedback de Foco para Acessibilidade --- */
      .btn:focus-visible {
        box-shadow: 0 0 0 2px var(--bg-900), 0 0 0 4px var(--accent-2);
      }

      .btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 18px rgba(2, 6, 23, 0.5);
      }
      .btn:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 4px 12px rgba(2, 6, 23, 0.4);
      }

      /* --- Tamanhos --- */
      .s-sm {
        padding: 6px 10px;
        font-size: 13px;
      }
      .s-md {
        padding: 10px 16px;
        font-size: 14px;
      }

      .block {
        width: 100%;
      }

      /* --- Variantes de Estilo --- */
      .v-primary {
        color: #071018; /* Texto escuro para contraste */
        border-color: transparent;
        background: var(--accent);
        box-shadow: 0 4px 14px rgba(46, 242, 123, 0.15);
      }
      .v-primary:hover:not(:disabled) {
        background: #4ff993; /* Versão mais clara do accent */
        box-shadow: 0 8px 20px rgba(46, 242, 123, 0.25);
      }

      .v-secondary {
        border-color: rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.22);
      }
      .v-secondary:hover:not(:disabled) {
        border-color: rgba(126, 231, 255, 0.5); /* Accent 2 */
        background: rgba(126, 231, 255, 0.05);
      }

      .v-outline {
        background: transparent;
        border-style: dashed;
        border-color: rgba(255, 255, 255, 0.15);
      }
      .v-outline:hover:not(:disabled) {
        border-color: var(--accent);
        background: rgba(46, 242, 123, 0.08);
      }

      .v-ghost {
        background: transparent;
        border-color: transparent;
        color: var(--muted);
      }
      .v-ghost:hover:not(:disabled) {
        color: var(--text);
        background: rgba(255, 255, 255, 0.04);
      }

      /* ... outras variantes ... */

      .btn:disabled {
        opacity: 0.5;
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
