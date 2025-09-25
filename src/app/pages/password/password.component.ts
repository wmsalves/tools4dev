import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToolCardComponent } from '../../shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { copyToClipboard } from '../../shared/utils/copy-to-clipboard';
import { ToastService } from '../../shared/toast/toast.service';

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
            [(ngModel)]="lenValue"
            (ngModelChange)="setLen($event)"
          />
        </div>

        <label class="chk"
          ><input
            type="checkbox"
            [(ngModel)]="useLowerValue"
            (ngModelChange)="setUseLower($event)"
          />
          Lowercase (a–z)</label
        >
        <label class="chk"
          ><input
            type="checkbox"
            [(ngModel)]="useUpperValue"
            (ngModelChange)="setUseUpper($event)"
          />
          Uppercase (A–Z)</label
        >
        <label class="chk"
          ><input
            type="checkbox"
            [(ngModel)]="useDigitsValue"
            (ngModelChange)="setUseDigits($event)"
          />
          Digits (0–9)</label
        >
        <label class="chk"
          ><input
            type="checkbox"
            [(ngModel)]="useSymbolsValue"
            (ngModelChange)="setUseSymbols($event)"
          />
          Symbols (!@#$…)</label
        >
        <label class="chk"
          ><input
            type="checkbox"
            [(ngModel)]="avoidAmbiguousValue"
            (ngModelChange)="setAvoidAmbiguous($event)"
          />
          Avoid ambiguous (O0l1|I)</label
        >
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
            [(ngModel)]="countValue"
            (ngModelChange)="setCount($event)"
          />
        </div>
        <ui-button (click)="generateMany()">Generate list</ui-button>
        <ui-button [disabled]="!list().length" (click)="copyList()">Copy list</ui-button>
        <span class="muted" *ngIf="list().length">({{ list().length }} items)</span>
      </div>

      <pre *ngIf="list().length" class="list">{{
        list().join(
          '
'
        )
      }}</pre>

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
        gap: 8px;
        flex-wrap: wrap;
      }
      .field {
        display: grid;
        gap: 6px;
      }
      .field input {
        background: rgba(0, 0, 0, 0.18);
        border-color: rgba(255, 255, 255, 0.06);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
        border-radius: 12px;
        padding: 10px 12px;
        border: 1px solid #e5e7eb;
        outline: none;
        width: 120px;
      }
      .field input:focus {
        border-color: #0f172a;
      }
      .chk {
        display: inline-flex;
        gap: 8px;
        align-items: center;
      }
      .result {
        margin-top: 4px;
      }
      .code {
        background: #0b1220;
        color: #e5e7eb;
        padding: 6px 10px;
        border-radius: 8px;
        display: inline-block;
      }
      .muted {
        color: #6b7280;
      }
      .hr {
        height: 1px;
        background: #e5e7eb;
        margin: 8px 0;
      }
      .list {
        max-height: 300px;
        overflow: auto;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 12px;
      }

      .meter {
        height: 8px;
        background: #e5e7eb;
        border-radius: 999px;
        overflow: hidden;
        margin-top: 8px;
        width: 280px;
        max-width: 100%;
      }
      .bar {
        height: 100%;
        background: linear-gradient(90deg, #ef4444, #f59e0b, #22c55e);
      }
    `,
  ],
})
export class PasswordComponent {
  private toast = new ToastService();

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

  // ngModel bridges
  lenValue = this.len();
  useLowerValue = this.useLower();
  useUpperValue = this.useUpper();
  useDigitsValue = this.useDigits();
  useSymbolsValue = this.useSymbols();
  avoidAmbiguousValue = this.avoidAmbiguous();
  countValue = this.count();

  setLen(v: number) {
    this.len.set(this.clamp(+v, 4, 128));
    this.lenValue = this.len();
  }
  setUseLower(v: boolean) {
    this.useLower.set(!!v);
    this.useLowerValue = this.useLower();
  }
  setUseUpper(v: boolean) {
    this.useUpper.set(!!v);
    this.useUpperValue = this.useUpper();
  }
  setUseDigits(v: boolean) {
    this.useDigits.set(!!v);
    this.useDigitsValue = this.useDigits();
  }
  setUseSymbols(v: boolean) {
    this.useSymbols.set(!!v);
    this.useSymbolsValue = this.useSymbols();
  }
  setAvoidAmbiguous(v: boolean) {
    this.avoidAmbiguous.set(!!v);
    this.avoidAmbiguousValue = this.avoidAmbiguous();
  }
  setCount(v: number) {
    this.count.set(this.clamp(Math.floor(+v || 0), 1, 500));
    this.countValue = this.count();
  }

  strengthBits = computed(() =>
    estimateEntropyBits({
      len: this.len(),
      lower: this.useLower(),
      upper: this.useUpper(),
      digits: this.useDigits(),
      symbols: this.useSymbols(),
      avoidAmbiguous: this.avoidAmbiguous(),
    })
  );
  strengthPct = computed(() => Math.max(0, Math.min(100, Math.round(this.strengthBits() / 1.2)))); // mapeia ~120 bits => 100%
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

  generateOne() {
    const { len, lower, upper, digits, symbols, avoidAmbiguous } = this.getCfg();
    try {
      const pwd = generatePassword({ len, lower, upper, digits, symbols, avoidAmbiguous });
      this.current.set(pwd);
      this.toast.success('Password generated');
    } catch (e: any) {
      this.toast.error(e?.message ?? 'Failed to generate password');
    }
  }

  copy() {
    const v = this.current();
    if (!v) return;
    copyToClipboard(v).then((ok) =>
      ok ? this.toast.success('Copied password') : this.toast.error('Copy failed')
    );
  }

  generateMany() {
    const cfg = this.getCfg();
    const arr = Array.from({ length: this.count() }, () => generatePassword(cfg));
    this.list.set(arr);
    this.toast.success(`Generated ${arr.length} passwords`);
  }

  copyList() {
    const text = this.list().join('\n');
    if (!text) return;
    copyToClipboard(text).then((ok) =>
      ok ? this.toast.success('List copied') : this.toast.error('Copy failed')
    );
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
    return Math.min(max, Math.max(min, n));
  }
}

/* ===== Helpers ===== */

type GenCfg = {
  len: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  avoidAmbiguous: boolean;
};

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = `!@#$%^&*()_+-=[]{}|;:,.<>?/~`;
const AMBIGUOUS = new Set('O0oIl1|I5S2Z');

function secureRandomInt(maxExclusive: number): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    // rejeição para evitar bias
    const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
    let x = a[0];
    while (x >= limit) {
      crypto.getRandomValues(a);
      x = a[0];
    }
    return x % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive); // fallback
}

function pickFrom(chars: string): string {
  return chars[secureRandomInt(chars.length)];
}

function buildAlphabet({
  lower,
  upper,
  digits,
  symbols,
  avoidAmbiguous,
}: Omit<GenCfg, 'len'>): string {
  let pool = '';
  if (lower) pool += LOWER;
  if (upper) pool += UPPER;
  if (digits) pool += DIGITS;
  if (symbols) pool += SYMBOLS;
  if (!pool) throw new Error('Select at least one character set');

  if (avoidAmbiguous) {
    pool = Array.from(pool)
      .filter((ch) => !AMBIGUOUS.has(ch))
      .join('');
  }
  if (!pool) throw new Error('Character pool empty after removing ambiguous characters');

  return pool;
}

function generatePassword(cfg: GenCfg): string {
  const { len, lower, upper, digits, symbols } = cfg;
  const pool = buildAlphabet(cfg);

  // garanta ao menos 1 de cada conjunto selecionado
  const required: string[] = [];
  if (lower)
    required.push(
      pickFrom(buildAlphabet({ ...cfg, lower: true, upper: false, digits: false, symbols: false }))
    );
  if (upper)
    required.push(
      pickFrom(buildAlphabet({ ...cfg, lower: false, upper: true, digits: false, symbols: false }))
    );
  if (digits)
    required.push(
      pickFrom(buildAlphabet({ ...cfg, lower: false, upper: false, digits: true, symbols: false }))
    );
  if (symbols)
    required.push(
      pickFrom(buildAlphabet({ ...cfg, lower: false, upper: false, digits: false, symbols: true }))
    );

  if (required.length > len) throw new Error('Length too small for selected constraints');

  const restLen = len - required.length;
  const rest = Array.from({ length: restLen }, () => pickFrom(pool));
  const arr = [...required, ...rest];

  // shuffle Fisher–Yates (secure)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.join('');
}

// estimativa grosseira de entropia (bits)
function estimateEntropyBits(cfg: Omit<GenCfg, 'len'> & { len: number }): number {
  const pool = buildAlphabet(cfg);
  const N = pool.length;
  return Math.round(cfg.len * Math.log2(N));
}
