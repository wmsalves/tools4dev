import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToolCardComponent } from '../../shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { copyToClipboard } from '../../shared/utils/copy-to-clipboard';
import { ToastService } from '../../shared/toast/toast.service';

type Unit = 'seconds' | 'milliseconds';

@Component({
  standalone: true,
  selector: 'app-timestamp',
  imports: [CommonModule, FormsModule, ToolCardComponent, ButtonComponent, BadgeComponent],
  template: `
    <tool-card
      title="Timestamp Converter"
      subtitle="Convert between Unix epoch and local date/time."
      [hasActions]="true"
    >
      <!-- Epoch -> Local -->
      <h3>Epoch → Local</h3>
      <div class="row">
        <div class="field">
          <label for="epoch">Epoch</label>
          <input
            id="epoch"
            type="text"
            placeholder="e.g. 1732567890 or 1732567890123"
            [(ngModel)]="epochValue"
            (ngModelChange)="onEpochChange($event)"
          />
        </div>

        <div class="field">
          <label>Unit</label>
          <div class="inline">
            <label class="chk"
              ><input
                type="radio"
                name="u1"
                value="seconds"
                [(ngModel)]="unitValue"
                (ngModelChange)="onUnitChange($event)"
              />
              Seconds</label
            >
            <label class="chk"
              ><input
                type="radio"
                name="u1"
                value="milliseconds"
                [(ngModel)]="unitValue"
                (ngModelChange)="onUnitChange($event)"
              />
              Milliseconds</label
            >
          </div>
        </div>

        <label
          class="chk"
          title="If on, large numbers (>= 1e12) are treated as milliseconds even if 'Seconds' is selected."
        >
          <input
            type="checkbox"
            [(ngModel)]="autoDetectValue"
            (ngModelChange)="onAutoDetectChange($event)"
          />
          Auto-detect ms
        </label>

        <div class="btn-group">
          <ui-button size="sm" variant="secondary" (click)="copyRawEpoch()">Copy</ui-button>
          <ui-button size="sm" variant="ghost" (click)="clearEpoch()" [disabled]="!epochValue"
            >Clear</ui-button
          >
        </div>
      </div>

      <div class="row">
        <div class="info">
          <div><strong>Local:</strong> {{ localOut() || '—' }}</div>
          <div><strong>UTC:</strong> {{ utcOut() || '—' }}</div>
          <div class="small muted" *ngIf="isoOut()">
            ISO (UTC): <code class="code">{{ isoOut() }}</code>
            <span class="btn-group" style="margin-left:8px">
              <ui-button size="sm" variant="ghost" (click)="copyISO()" [disabled]="!isoOut()"
                >Copy ISO</ui-button
              >
              <ui-button size="sm" variant="ghost" (click)="copyUTC()" [disabled]="!utcOut()"
                >Copy UTC</ui-button
              >
              <ui-button size="sm" variant="ghost" (click)="copyLocalStr()" [disabled]="!localOut()"
                >Copy Local</ui-button
              >
            </span>
          </div>
          <div class="err" *ngIf="errorMsg()">{{ errorMsg() }}</div>
        </div>
      </div>

      <div class="hr"></div>

      <!-- Local -> Epoch -->
      <h3>Local → Epoch</h3>
      <div class="row">
        <div class="field">
          <label for="dt">Local date/time</label>
          <input
            id="dt"
            type="datetime-local"
            [(ngModel)]="localValue"
            (ngModelChange)="onLocalChange($event)"
          />
        </div>

        <div class="field">
          <label>Unit</label>
          <div class="inline">
            <label class="chk"
              ><input
                type="radio"
                name="u2"
                value="seconds"
                [(ngModel)]="unitValue"
                (ngModelChange)="onUnitChange($event)"
              />
              Seconds</label
            >
            <label class="chk"
              ><input
                type="radio"
                name="u2"
                value="milliseconds"
                [(ngModel)]="unitValue"
                (ngModelChange)="onUnitChange($event)"
              />
              Milliseconds</label
            >
          </div>
        </div>

        <div class="btn-group">
          <ui-button size="sm" (click)="setNow()">Now</ui-button>
          <ui-button
            size="sm"
            variant="secondary"
            (click)="copyEpochFromLocal()"
            [disabled]="epochFromLocal() == null"
            >Copy</ui-button
          >
          <ui-button size="sm" variant="ghost" (click)="clearLocal()" [disabled]="!localValue"
            >Clear</ui-button
          >
        </div>
      </div>

      <div class="row">
        <div class="info">
          <div>
            <strong>Epoch:</strong>
            <code class="code">{{ epochFromLocal() ?? '—' }}</code>
            <ui-badge *ngIf="epochFromLocal() != null" variant="success">{{ unitValue }}</ui-badge>
          </div>
          <div class="muted small">TZ offset: {{ tzOffsetStr() }}</div>
        </div>
      </div>

      <div actions>
        <small class="muted">
          When “Auto-detect ms” is on, long numbers (≥ 1e12) are treated as milliseconds. Fractions
          in seconds are supported (e.g. 1700000000.5).
        </small>
      </div>
    </tool-card>
  `,
  styles: [
    `
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .field {
        display: grid;
        gap: 6px;
      }
      .field input {
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        outline: none;
        background: var(--panel);
        color: var(--text);
        min-width: 240px;
      }
      .field input:focus {
        border-color: rgba(46, 242, 123, 0.24);
        box-shadow: 0 0 0 3px rgba(46, 242, 123, 0.08);
      }
      .inline {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .chk {
        display: inline-flex;
        gap: 6px;
        align-items: center;
        color: var(--muted);
      }
      .hr {
        height: 1px;
        background: rgba(255, 255, 255, 0.06);
        margin: 8px 0;
      }
      .info {
        display: grid;
        gap: 6px;
      }
      .muted {
        color: var(--muted);
      }
      .small {
        font-size: 12px;
      }
      .code {
        background: #0b1220;
        color: #c8fdf7;
        padding: 3px 6px;
        border-radius: 6px;
      }
      .err {
        color: #ffb3b3;
        background: rgba(255, 107, 107, 0.08);
        border: 1px solid rgba(255, 107, 107, 0.24);
        padding: 8px 10px;
        border-radius: 10px;
      }
    `,
  ],
})
export class TimestampComponent {
  private toast = new ToastService();

  // UI state
  epochValue = '';
  localValue = '';
  unitValue: Unit = 'seconds';
  autoDetectValue = true;

  errorMsg = signal<string>('');

  // ===== Epoch -> Local =====
  private parsedEpochMs = computed<number | null>(() => {
    this.errorMsg.set('');
    const raw = (this.epochValue || '').trim();
    if (!raw) return null;

    // aceita underscores/espacos e vírgula decimal
    const cleaned = raw.replace(/[\s_]/g, '').replace(',', '.');
    const n = Number(cleaned);
    if (!Number.isFinite(n)) {
      this.errorMsg.set('Invalid number.');
      return null;
    }

    const isLikelyMs = Math.abs(n) >= 1e12 || /^\d{12,}$/.test(cleaned);
    let ms: number;

    if (this.autoDetectValue && isLikelyMs) {
      ms = Math.trunc(n);
    } else {
      ms = this.unitValue === 'seconds' ? Math.trunc(n * 1000) : Math.trunc(n);
    }

    // range de Date (~±8.64e15 ms)
    if (!Number.isFinite(ms) || Math.abs(ms) > 8.64e15) {
      this.errorMsg.set('Out of supported range.');
      return null;
    }

    try {
      new Date(ms).toISOString();
    } catch {
      this.errorMsg.set('Invalid timestamp.');
      return null;
    }
    return ms;
  });

  localOut = computed(() => {
    const ms = this.parsedEpochMs();
    return ms == null ? '' : new Date(ms).toLocaleString();
  });

  utcOut = computed(() => {
    const ms = this.parsedEpochMs();
    return ms == null ? '' : new Date(ms).toUTCString();
  });

  isoOut = computed(() => {
    const ms = this.parsedEpochMs();
    return ms == null ? '' : new Date(ms).toISOString();
  });

  // ===== Local -> Epoch =====
  epochFromLocal = computed<string | null>(() => {
    const v = (this.localValue || '').trim();
    if (!v) return null;
    const ms = parseLocalDateTimeToMs(v);
    if (ms == null) return null;
    return this.unitValue === 'seconds' ? String(Math.trunc(ms / 1000)) : String(ms);
  });

  tzOffsetStr = computed(() => {
    const minutes = -new Date().getTimezoneOffset();
    const sign = minutes >= 0 ? '+' : '-';
    const abs = Math.abs(minutes);
    const hh = String(Math.trunc(abs / 60)).padStart(2, '0');
    const mm = String(abs % 60).padStart(2, '0');
    return `UTC${sign}${hh}:${mm}`;
  });

  // handlers
  onEpochChange(v: string) {
    this.epochValue = v;
  }
  onUnitChange(v: Unit) {
    this.unitValue = v;
  }
  onAutoDetectChange(v: boolean) {
    this.autoDetectValue = !!v;
  }
  onLocalChange(v: string) {
    this.localValue = v;
  }

  clearEpoch() {
    this.epochValue = '';
    this.errorMsg.set('');
  }
  setNow() {
    this.localValue = toDatetimeLocalValue(new Date());
  }
  clearLocal() {
    this.localValue = '';
  }

  // copy helpers
  copyRawEpoch() {
    const v = (this.epochValue || '').trim();
    if (!v) return;
    copyToClipboard(v).then((ok) =>
      ok ? this.toast.success('Epoch copied') : this.toast.error('Copy failed')
    );
  }
  copyISO() {
    const v = this.isoOut();
    if (!v) return;
    copyToClipboard(v).then((ok) =>
      ok ? this.toast.success('ISO copied') : this.toast.error('Copy failed')
    );
  }
  copyUTC() {
    const v = this.utcOut();
    if (!v) return;
    copyToClipboard(v).then((ok) =>
      ok ? this.toast.success('UTC copied') : this.toast.error('Copy failed')
    );
  }
  copyLocalStr() {
    const v = this.localOut();
    if (!v) return;
    copyToClipboard(v).then((ok) =>
      ok ? this.toast.success('Local date copied') : this.toast.error('Copy failed')
    );
  }
  copyEpochFromLocal() {
    const v = this.epochFromLocal();
    if (!v) return;
    copyToClipboard(v).then((ok) =>
      ok ? this.toast.success('Epoch copied') : this.toast.error('Copy failed')
    );
  }
}

/* ===== helpers ===== */

function parseLocalDateTimeToMs(input: string): number | null {
  const m = input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const [_, y, mo, d, h, mi, s] = m;
  const year = +y,
    month = +mo - 1,
    day = +d,
    hour = +h,
    minute = +mi,
    sec = +(s ?? '0');
  const dt = new Date(year, month, day, hour, minute, sec, 0);
  const ms = dt.getTime();
  return Number.isFinite(ms) ? ms : null;
}
function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
