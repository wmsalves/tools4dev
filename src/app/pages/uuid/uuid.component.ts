import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToolCardComponent } from '../../shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';

import { copyToClipboard } from '../../shared/utils/copy-to-clipboard';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-uuid',
  imports: [CommonModule, FormsModule, ToolCardComponent, ButtonComponent, BadgeComponent],
  template: `
    <tool-card
      title="UUID Generator"
      subtitle="Generate RFC 4122 version 4 UUIDs for testing."
      [hasActions]="true"
    >
      <div class="row">
        <ui-button (click)="generateOne()">Generate</ui-button>
        <ui-button [disabled]="!current()" (click)="copyCurrent()">Copy</ui-button>
        <ui-badge *ngIf="currentValid()" variant="success">Valid v4</ui-badge>
        <ui-badge *ngIf="current() && !currentValid()" variant="danger">Invalid</ui-badge>
      </div>

      <div *ngIf="current(); else nores" class="result">
        <code class="code">{{ current() }}</code>
      </div>
      <ng-template #nores>
        <div class="muted">No UUID generated yet.</div>
      </ng-template>

      <div class="hr"></div>

      <h3>Options</h3>
      <div class="opts">
        <label
          ><input
            type="checkbox"
            [(ngModel)]="uppercaseValue"
            (ngModelChange)="setUppercase($event)"
          />
          Uppercase</label
        >
        <label
          ><input
            type="checkbox"
            [(ngModel)]="noHyphensValue"
            (ngModelChange)="setNoHyphens($event)"
          />
          Remove hyphens</label
        >
      </div>

      <div class="hr"></div>

      <h3>Bulk</h3>
      <div class="row">
        <div class="field">
          <label for="count">Count</label>
          <input
            id="count"
            type="number"
            min="1"
            max="1000"
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
          >Uses <code>crypto.randomUUID()</code> when available, with secure fallback.</small
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
      .opts {
        display: flex;
        gap: 16px;
        align-items: center;
      }
      .opts label {
        display: inline-flex;
        gap: 8px;
        align-items: center;
      }
      .field {
        display: grid;
        gap: 6px;
      }
      .field input {
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        outline: none;
        background: #fff;
        width: 120px;
      }
      .field input:focus {
        border-color: #0f172a;
      }
      .list {
        max-height: 300px;
        overflow: auto;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 12px;
      }
    `,
  ],
})
export class UuidComponent {
  private toast = new ToastService();

  // state
  current = signal<string>('');
  list = signal<string[]>([]);

  uppercase = signal<boolean>(false);
  noHyphens = signal<boolean>(false);
  count = signal<number>(10);

  // ngModel bridges
  uppercaseValue = this.uppercase();
  noHyphensValue = this.noHyphens();
  countValue = this.count();

  setUppercase(v: boolean) {
    this.uppercase.set(!!v);
    this.uppercaseValue = this.uppercase();
    this.applyOptions();
  }
  setNoHyphens(v: boolean) {
    this.noHyphens.set(!!v);
    this.noHyphensValue = this.noHyphens();
    this.applyOptions();
  }
  setCount(v: number) {
    const n = Math.floor(+v || 0);
    this.count.set(Math.max(1, Math.min(1000, n)));
    this.countValue = this.count();
  }

  currentValid = computed(() => isUuidV4(this.current()));

  generateOne() {
    const raw = uuidV4();
    this.current.set(this.format(raw));
    this.toast.success('UUID generated');
  }

  copyCurrent() {
    if (!this.current()) return;
    copyToClipboard(this.current()).then((ok) =>
      ok ? this.toast.success('Copied UUID') : this.toast.error('Copy failed')
    );
  }

  generateMany() {
    const n = this.count();
    const arr = Array.from({ length: n }, () => this.format(uuidV4()));
    this.list.set(arr);
    this.toast.success(`Generated ${n} UUID${n > 1 ? 's' : ''}`);
  }

  copyList() {
    const text = this.list().join('\n');
    if (!text) return;
    copyToClipboard(text).then((ok) =>
      ok ? this.toast.success('List copied') : this.toast.error('Copy failed')
    );
  }

  private applyOptions() {
    const cur = this.current();
    if (!cur) return;
    // re-apply formatting to current (idempotente)
    this.current.set(this.format(stripFormatting(cur)));
    // re-apply to list
    if (this.list().length) {
      this.list.set(this.list().map((s) => this.format(stripFormatting(s))));
    }
  }

  private format(raw: string) {
    let out = this.noHyphens() ? raw.replace(/-/g, '') : raw;
    if (this.uppercase()) out = out.toUpperCase();
    return out;
  }
}

/* ===== Helpers ===== */

function uuidV4(): string {
  // Prefer native secure API
  if (
    typeof crypto !== 'undefined' &&
    'randomUUID' in crypto &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  // Fallback using getRandomValues
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Last resort (menos seguro, apenas para ambientes sem crypto)
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  // Per RFC 4122 v4
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant

  const hex: string[] = [];
  for (let i = 0; i < 256; i++) hex[i] = (i + 0x100).toString(16).substring(1);

  return (
    hex[bytes[0]] +
    hex[bytes[1]] +
    hex[bytes[2]] +
    hex[bytes[3]] +
    '-' +
    hex[bytes[4]] +
    hex[bytes[5]] +
    '-' +
    hex[bytes[6]] +
    hex[bytes[7]] +
    '-' +
    hex[bytes[8]] +
    hex[bytes[9]] +
    '-' +
    hex[bytes[10]] +
    hex[bytes[11]] +
    hex[bytes[12]] +
    hex[bytes[13]] +
    hex[bytes[14]] +
    hex[bytes[15]]
  );
}

function isUuidV4(s: string): boolean {
  // Aceita com ou sem hyphens; checa version/variant
  const str = stripFormatting(s).toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(str)) return false;
  // 12º nibble (posição 12 zero-based) deve ser '4'
  if (str[12] !== '4') return false;
  // 16º nibble deve ser 8,9,a,b
  if (!/[89ab]/.test(str[16])) return false;
  return true;
}

function stripFormatting(s: string) {
  return s.replace(/-/g, '');
}
