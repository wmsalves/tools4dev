import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordService } from '@app/core/services/password.service';
import { ToolCardComponent } from '@shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { ToastService } from '@app/shared/toast/toast.service';
import { copyToClipboard } from '@shared/utils/copy-to-clipboard';

@Component({
  standalone: true,
  selector: 'app-password',
  imports: [CommonModule, FormsModule, ToolCardComponent, ButtonComponent, BadgeComponent],
  template: `
    <tool-card
      title="Password Generator"
      subtitle="Create secure passwords with custom rules."
      [hasActions]="true"
    >
      <!-- Seção de Opções -->
      <div class="form-group">
        <div class="form-row">
          <div class="field">
            <label for="len">Length</label>
            <input id="len" type="number" min="4" max="128" step="1" [(ngModel)]="len" />
          </div>
        </div>

        <div class="checkbox-group">
          <label class="chk">
            <input type="checkbox" [(ngModel)]="useLower" /> Lowercase (a–z)
          </label>
          <label class="chk">
            <input type="checkbox" [(ngModel)]="useUpper" /> Uppercase (A–Z)
          </label>
          <label class="chk">
            <input type="checkbox" [(ngModel)]="useDigits" /> Digits (0–9)
          </label>
          <label class="chk">
            <input type="checkbox" [(ngModel)]="useSymbols" /> Symbols (!@#$…)
          </label>
          <label class="chk">
            <input type="checkbox" [(ngModel)]="avoidAmbiguous" /> Avoid ambiguous (O0l1|I)
          </label>
        </div>
      </div>

      <!-- Seção de Ações e Resultado -->
      <div class="btn-group">
        <ui-button (click)="generateOne()">Generate</ui-button>
        <ui-button variant="secondary" [disabled]="!current()" (click)="copy()">Copy</ui-button>
        <ui-badge *ngIf="current()" [variant]="strengthBadgeVariant()">
          {{ strengthLabel() }}
        </ui-badge>
      </div>

      <div *ngIf="current(); else nores" class="result">
        <code class="code">{{ current() }}</code>
        <div class="meter">
          <div class="bar" [style.width.%]="strengthPct()"></div>
        </div>
      </div>
      <ng-template #nores>
        <div class="muted">No password generated yet.</div>
      </ng-template>

      <div class="hr"></div>

      <!-- Seção de Geração em Massa -->
      <h3>Bulk</h3>
      <div class="form-group">
        <div class="form-row">
          <div class="field">
            <label for="count">Count</label>
            <input id="count" type="number" min="1" max="500" step="1" [(ngModel)]="count" />
          </div>
          <div class="btn-group">
            <ui-button (click)="generateMany()">Generate list</ui-button>
            <ui-button variant="secondary" [disabled]="!list().length" (click)="copyList()"
              >Copy list</ui-button
            >
          </div>
        </div>
      </div>

      <pre *ngIf="list().length" class="list">{{ list().join('\\n') }}</pre>

      <div actions>
        <small class="muted"
          >Passwords are generated client-side using secure random when available.</small
        >
      </div>
    </tool-card>
  `,
  styles: [
    `
      /* --- Estrutura de Layout do Formulário --- */
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 16px; /* Espaçamento vertical entre as linhas */
        margin-bottom: 20px;
      }
      .form-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end; /* Alinha labels e inputs na base */
        gap: 16px; /* Espaçamento horizontal entre os campos */
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 8px; /* Espaço entre label e input */
      }
      .field input {
        width: 120px; /* Largura padrão para inputs numéricos */
      }
      .checkbox-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px 20px; /* Gap vertical e horizontal */
      }
      .chk {
        display: inline-flex;
        gap: 8px;
        align-items: center;
      }
      .btn-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }

      /* --- Estilos Visuais --- */
      .result {
        margin-bottom: 20px;
      }
      .code {
        background: var(--panel);
        color: var(--accent-2);
        padding: 8px 12px;
        border-radius: 8px;
        display: inline-block;
        font-size: 1.1rem;
        border: 1px solid var(--glass);
      }
      .muted {
        color: var(--muted);
      }
      .hr {
        height: 1px;
        background: var(--glass);
        margin: 24px 0;
        border: none;
      }
      .list {
        max-height: 300px;
        overflow: auto;
        background: var(--panel);
        border: 1px solid var(--glass);
        border-radius: 12px;
        padding: 12px;
        white-space: pre-wrap;
        word-break: break-all;
      }
      .meter {
        height: 6px;
        background: var(--panel);
        border-radius: 999px;
        overflow: hidden;
        margin-top: 12px;
        width: 280px;
        max-width: 100%;
        border: 1px solid var(--glass);
      }
      .bar {
        height: 100%;
        background: linear-gradient(90deg, #ef4444, #f59e0b, #22c55e);
      }
    `,
  ],
})
export class PasswordComponent {
  private passwordService = inject(PasswordService);
  private toast = inject(ToastService);

  // state
  current = signal<string>('');
  list = signal<string[]>([]);
  len = signal<number>(16);
  useLower = signal<boolean>(true);
  useUpper = signal<boolean>(true);
  useDigits = signal<boolean>(true);
  useSymbols = signal<boolean>(false);
  avoidAmbiguous = signal<boolean>(true);
  count = signal<number>(10);

  // computed
  strengthBits = computed(() => {
    return this.passwordService.estimateEntropy({
      len: this.len(),
      lower: this.useLower(),
      upper: this.useUpper(),
      digits: this.useDigits(),
      symbols: this.useSymbols(),
      avoidAmbiguous: this.avoidAmbiguous(),
    });
  });
  strengthPct = computed(() => Math.max(0, Math.min(100, Math.round(this.strengthBits() / 1.2)))); // mapeia ~120 bits => 100%
  strengthLabel = computed(() => {
    const b = this.strengthBits();
    if (b < 40) return 'Weak';
    if (b < 60) return 'Fair';
    if (b < 80) return 'Good';
    return 'Strong';
  });
  strengthBadgeVariant = computed(() => {
    const label = this.strengthLabel();
    if (label === 'Weak') return 'danger';
    if (label === 'Fair') return '';
    return 'success';
  });

  // actions
  generateOne() {
    const cfg = this.getCfg();
    try {
      const pwd = this.passwordService.generate(cfg);
      this.current.set(pwd);
      this.toast.success('Password generated');
    } catch (e: any) {
      this.toast.error(e?.message ?? 'Failed to generate password');
    }
  }

  async copy() {
    const v = this.current();
    if (!v) return;
    const ok = await copyToClipboard(v);
    ok ? this.toast.success('Copied password') : this.toast.error('Copy failed');
  }

  generateMany() {
    const cfg = this.getCfg();
    try {
      const arr = Array.from({ length: this.count() }, () => this.passwordService.generate(cfg));
      this.list.set(arr);
      this.toast.success(`Generated ${arr.length} passwords`);
    } catch (e: any) {
      this.toast.error(e?.message ?? 'Failed to generate passwords');
    }
  }

  async copyList() {
    const text = this.list().join('\\n');
    if (!text) return;
    const ok = await copyToClipboard(text);
    ok ? this.toast.success('List copied') : this.toast.error('Copy failed');
  }

  private getCfg() {
    return {
      len: this.len(),
      lower: this.useLower(),
      upper: this.useUpper(),
      digits: this.useDigits(),
      symbols: this.useSymbols(),
      avoidAmbiguous: this.avoidAmbiguous(),
    };
  }
}
