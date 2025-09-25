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
                name="unit"
                value="seconds"
                [(ngModel)]="unitValue"
                (ngModelChange)="onUnitChange($event)"
              />
              Seconds</label
            >
            <label class="chk"
              ><input
                type="radio"
                name="unit"
                value="milliseconds"
                [(ngModel)]="unitValue"
                (ngModelChange)="onUnitChange($event)"
              />
              Milliseconds</label
            >
          </div>
        </div>

        <ui-button (click)="copyEpoch()">Copy</ui-button>
        <ui-button variant="ghost" (click)="clearEpoch()" [disabled]="!epochValue">Clear</ui-button>
      </div>

      <div class="row">
        <div class="info">
          <div><strong>Local:</strong> {{ localOut() || '—' }}</div>
          <div><strong>UTC:</strong> {{ utcOut() || '—' }}</div>
          <div *ngIf="epochParsed() >= 0" class="muted small">
            <span>ISO (UTC):</span>
            <code class="code">{{ isoOut() }}</code>
          </div>
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
                name="unit2"
                value="seconds"
                [(ngModel)]="unitValue"
                (ngModelChange)="onUnitChange($event)"
              />
              Seconds</label
            >
            <label class="chk"
              ><input
                type="radio"
                name="unit2"
                value="milliseconds"
                [(ngModel)]="unitValue"
                (ngModelChange)="onUnitChange($event)"
              />
              Milliseconds</label
            >
          </div>
        </div>

        <ui-button (click)="setNow()">Now</ui-button>
        <ui-button (click)="copyLocal()">Copy</ui-button>
        <ui-button variant="ghost" (click)="clearLocal()" [disabled]="!localValue">Clear</ui-button>
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
          Parsing is lenient: long epoch numbers auto-detect milliseconds. All conversions happen
          client-side.
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
        border: 1px solid #e5e7eb;
        outline: none;
        background: #fff;
        min-width: 240px;
      }
      .field input:focus {
        border-color: #0f172a;
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
      }
      .hr {
        height: 1px;
        background: #e5e7eb;
        margin: 8px 0;
      }
      .info {
        display: grid;
        gap: 6px;
      }
      .muted {
        color: #6b7280;
      }
      .small {
        font-size: 12px;
      }
      .code {
        background: #0b1220;
        color: #e5e7eb;
        padding: 3px 6px;
        border-radius: 6px;
      }
    `,
  ],
})
export class TimestampComponent {
  private toast = new ToastService();

  // state fields (two-way bridges)
  epochValue = '';
  localValue = '';
  unitValue: Unit = 'seconds';

  // ===== Epoch -> Local =====
  epochParsed = computed<number>(() => {
    const raw = (this.epochValue || '').trim();
    if (!raw) return -1;
    const n = Number(raw);
    if (!Number.isFinite(n)) return -1;

    // auto-detect: se for muito grande assume ms (>= 1e12 ~ 2001 em ms)
    if (this.unitValue === 'seconds') {
      if (Math.abs(n) >= 1e12) {
        // provavelmente veio em ms mas o usuário marcou "seconds"
        // trata como ms para não quebrar a UX
        return Math.trunc(n);
      }
      return Math.trunc(n * 1000);
    } else {
      // milliseconds
      return Math.trunc(n);
    }
  });

  localOut = computed<string>(() => {
    const ms = this.epochParsed();
    if (ms < 0) return '';
    try {
      const d = new Date(ms);
      return d.toLocaleString();
    } catch {
      return '';
    }
  });

  utcOut = computed<string>(() => {
    const ms = this.epochParsed();
    if (ms < 0) return '';
    try {
      const d = new Date(ms);
      return d.toUTCString();
    } catch {
      return '';
    }
  });

  isoOut = computed<string>(() => {
    const ms = this.epochParsed();
    if (ms < 0) return '';
    try {
      return new Date(ms).toISOString();
    } catch {
      return '';
    }
  });

  // ===== Local -> Epoch =====
  epochFromLocal = computed<string | null>(() => {
    const v = (this.localValue || '').trim();
    if (!v) return null;
    const ms = parseLocalDateTimeToMs(v);
    if (ms == null) return null;
    return this.unitValue === 'seconds' ? String(Math.trunc(ms / 1000)) : String(ms);
  });

  tzOffsetStr = computed<string>(() => {
    const minutes = -new Date().getTimezoneOffset(); // offset do local (positivo para GMT+)
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
  onLocalChange(v: string) {
    this.localValue = v;
  }

  copyEpoch() {
    const v = (this.epochValue || '').trim();
    if (!v) return;
    copyToClipboard(v).then((ok) =>
      ok ? this.toast.success('Epoch copied') : this.toast.error('Copy failed')
    );
  }

  clearEpoch() {
    this.epochValue = '';
  }

  setNow() {
    const now = new Date();
    this.localValue = toDatetimeLocalValue(now);
  }

  copyLocal() {
    const v = this.epochFromLocal();
    if (!v) return;
    copyToClipboard(v).then((ok) =>
      ok ? this.toast.success('Epoch copied') : this.toast.error('Copy failed')
    );
  }

  clearLocal() {
    this.localValue = '';
  }
}

/* ===== helpers ===== */

// Converte "yyyy-MM-ddTHH:mm" (ou com :ss) para ms desde epoch no timezone local
function parseLocalDateTimeToMs(input: string): number | null {
  // Aceita "YYYY-MM-DDTHH:mm" e "YYYY-MM-DDTHH:mm:ss"
  const m = input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const [_, y, mo, d, h, mi, s] = m;
  const year = +y,
    month = +mo - 1,
    day = +d,
    hour = +h,
    minute = +mi,
    sec = +(s ?? '0');

  const dt = new Date(year, month, day, hour, minute, sec, 0); // local time
  const ms = dt.getTime();
  return Number.isFinite(ms) ? ms : null;
}

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}
