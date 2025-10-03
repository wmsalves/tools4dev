import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToolCardComponent } from '../../shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { copyToClipboard } from '../../shared/utils/copy-to-clipboard';
import { ToastService } from '../../shared/toast/toast.service';
import { PasswordService } from '@app/core/services/password.service';

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
      <div class="row">
        <div class="field">
          <label for="len">Length</label>
          <input
            id="len"
            type="number"
            min="4"
            max="128"
            step="1"
            [ngModel]="len()"
            (ngModelChange)="setLen($event)"
          />
        </div>

        <label class="chk">
          <input type="checkbox" [(ngModel)]="useLower" /> Lowercase (a–z)
        </label>
        <label class="chk">
          <input type="checkbox" [(ngModel)]="useUpper" /> Uppercase (A–Z)
        </label>
        <label class="chk"> <input type="checkbox" [(ngModel)]="useDigits" /> Digits (0–9) </label>
        <label class="chk">
          <input type="checkbox" [(ngModel)]="useSymbols" /> Symbols (!@#$…)
        </label>
        <label class="chk">
          <input type="checkbox" [(ngModel)]="avoidAmbiguous" /> Avoid ambiguous (O0l1|I)
        </label>
      </div>

      <div class="row">
        <ui-button (click)="generateOne()">Generate</ui-button>
        <ui-button [disabled]="!current()" (click)="copy()">Copy</ui-button>
        <ui-badge *ngIf="current()" [variant]="strengthBadgeVariant()">{{
          strengthLabel()
        }}</ui-badge>
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

      <h3>Bulk</h3>
      <div class="row">
        <div class="field">
          <label for="count">Count</label>
          <input
            id="count"
            type="number"
            min="1"
            max="500"
            step="1"
            [ngModel]="count()"
            (ngModelChange)="setCount($event)"
          />
        </div>
        <ui-button (click)="generateMany()">Generate list</ui-button>
        <ui-button [disabled]="!list().length" (click)="copyList()">Copy list</ui-button>
        <span class="muted" *ngIf="list().length">({{ list().length }} items)</span>
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
      .row {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .field {
        display: grid;
        gap: 6px;
      }
      .field input {
        width: 120px;
      }
      .chk {
        display: inline-flex;
        gap: 8px;
        align-items: center;
        user-select: none;
      }
      .result {
        margin-top: 16px;
      }
      .code {
        background: var(--panel);
        color: var(--text);
        padding: 8px 12px;
        border-radius: 8px;
        display: inline-block;
        border: 1px solid rgba(255, 255, 255, 0.05);
        font-size: 1.1rem;
        letter-spacing: 0.5px;
      }
      .muted {
        color: var(--muted);
      }
      .hr {
        height: 1px;
        background: rgba(255, 255, 255, 0.05);
        margin: 20px 0;
      }
      .list {
        max-height: 300px;
        overflow: auto;
        background: var(--panel);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        padding: 12px;
        white-space: pre-wrap;
        word-break: break-all;
      }

      .meter {
        height: 8px;
        background: rgba(0, 0, 0, 0.25);
        border-radius: 999px;
        overflow: hidden;
        margin-top: 8px;
        width: 280px;
        max-width: 100%;
        border: 1px solid rgba(255, 255, 255, 0.04);
      }
      .bar {
        height: 100%;
        background: linear-gradient(90deg, #ef4444, #f59e0b, #22c55e);
      }
    `,
  ],
})
export class PasswordComponent {
  private toast = inject(ToastService);
  private passwordService = inject(PasswordService);

  // State
  current = signal<string>('');
  list = signal<string[]>([]);

  len = signal<number>(16);
  useLower = signal<boolean>(true);
  useUpper = signal<boolean>(true);
  useDigits = signal<boolean>(true);
  useSymbols = signal<boolean>(false);
  avoidAmbiguous = signal<boolean>(true);
  count = signal<number>(10);

  // Derived state
  strengthBits = computed(() => this.passwordService.estimateEntropy(this.getCfg()));
  strengthPct = computed(() => Math.max(0, Math.min(100, Math.round(this.strengthBits() / 1.2))));
  strengthLabel = computed(() => {
    const b = this.strengthBits();
    if (b < 40) return 'Weak';
    if (b < 60) return 'Fair';
    if (b < 80) return 'Good';
    return 'Strong';
  });
  strengthBadgeVariant = computed(() =>
    this.strengthLabel() === 'Weak' ? 'danger' : this.strengthLabel() === 'Fair' ? '' : 'success'
  );

  // ngModelChange handlers for number inputs to clamp values
  setLen(value: string | number) {
    this.len.set(this.clamp(Number(value), 4, 128));
  }
  setCount(value: string | number) {
    this.count.set(this.clamp(Number(value), 1, 500));
  }

  generateOne() {
    try {
      const pwd = this.passwordService.generate(this.getCfg());
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
    const text = this.list().join('\n');
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

  private clamp(n: number, min: number, max: number) {
    if (Number.isNaN(n)) return min;
    return Math.min(max, Math.max(min, Math.floor(n)));
  }
}
