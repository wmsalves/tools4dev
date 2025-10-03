import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToolCardComponent } from '../../shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { copyToClipboard } from '../../shared/utils/copy-to-clipboard';
import { ToastService } from '../../shared/toast/toast.service';
import { TimestampService, Unit } from '@app/core/services/timestamp.service';

@Component({
  standalone: true,
  selector: 'app-timestamp',
  imports: [CommonModule, FormsModule, ToolCardComponent, ButtonComponent],
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
            [(ngModel)]="epochInput"
          />
        </div>

        <div class="field">
          <label>Unit</label>
          <div class="inline">
            <label class="chk">
              <input type="radio" name="u1" value="seconds" [(ngModel)]="unit" />
              Seconds
            </label>
            <label class="chk">
              <input type="radio" name="u1" value="milliseconds" [(ngModel)]="unit" />
              Milliseconds
            </label>
          </div>
        </div>

        <label
          class="chk"
          title="If on, large numbers (>= 1e12) are treated as milliseconds even if 'Seconds' is selected."
        >
          <input type="checkbox" [(ngModel)]="autoDetect" />
          Auto-detect ms
        </label>
      </div>

      <div class="row info-row">
        <div class="info">
          <div><strong>Local:</strong> {{ localOut() || '—' }}</div>
          <div><strong>UTC:</strong> {{ utcOut() || '—' }}</div>
          <div class="small muted" *ngIf="isoOut()">
            ISO (UTC): <code class="code">{{ isoOut() }}</code>
          </div>
          <div class="err" *ngIf="epochError()">{{ epochError() }}</div>
        </div>
        <div class="btn-group">
          <ui-button size="sm" variant="ghost" (click)="copy(isoOut())" [disabled]="!isoOut()"
            >Copy ISO</ui-button
          >
          <ui-button size="sm" variant="ghost" (click)="copy(utcOut())" [disabled]="!utcOut()"
            >Copy UTC</ui-button
          >
          <ui-button size="sm" variant="ghost" (click)="copy(localOut())" [disabled]="!localOut()"
            >Copy Local</ui-button
          >
        </div>
      </div>

      <div class="hr"></div>

      <!-- Local -> Epoch -->
      <h3>Local → Epoch</h3>
      <div class="row">
        <div class="field">
          <label for="dt">Local date/time</label>
          <input id="dt" type="datetime-local" step="1" [(ngModel)]="localInput" />
        </div>

        <div class="btn-group">
          <ui-button size="sm" (click)="setNow()">Now</ui-button>
          <ui-button
            size="sm"
            variant="secondary"
            (click)="copy(epochFromLocal())"
            [disabled]="!epochFromLocal()"
            >Copy Epoch</ui-button
          >
          <ui-button size="sm" variant="ghost" (click)="clearLocal()" [disabled]="!localInput()"
            >Clear</ui-button
          >
        </div>
      </div>

      <div class="row info-row">
        <div class="info">
          <div>
            <strong>Epoch:</strong>
            <code class="code">{{ epochFromLocal() ?? '—' }}</code>
          </div>
          <div class="muted small">TZ offset: {{ tzOffsetStr }}</div>
        </div>
      </div>

      <div actions>
        <small class="muted">
          When “Auto-detect ms” is on, large numbers (≥ 1e12) are treated as milliseconds.
        </small>
      </div>
    </tool-card>
  `,
  styles: [
    `
      h3 {
        margin-bottom: 12px;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .info-row {
        align-items: flex-start;
        justify-content: space-between;
        margin-top: 12px;
        min-height: 90px;
      }
      .field {
        display: grid;
        gap: 6px;
      }
      .field input {
        min-width: 280px;
      }
      .inline {
        display: flex;
        gap: 16px;
        align-items: center;
      }
      .chk {
        display: inline-flex;
        gap: 6px;
        align-items: center;
        color: var(--muted);
        user-select: none;
      }
      .hr {
        height: 1px;
        background: rgba(255, 255, 255, 0.05);
        margin: 24px 0;
      }
      .info {
        display: grid;
        gap: 8px;
      }
      .muted {
        color: var(--muted);
      }
      .small {
        font-size: 13px;
      }
      .code {
        background: var(--panel);
        color: var(--accent-2);
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .err {
        color: #ffb3b3;
        font-weight: 500;
      }
    `,
  ],
})
export class TimestampComponent {
  private toast = inject(ToastService);
  private tsService = inject(TimestampService);

  // UI state signals
  epochInput = signal('');
  localInput = signal('');
  unit = signal<Unit>('seconds');
  autoDetect = signal(true);

  // === Epoch -> Local Derived State ===
  private epochConversion = computed(() =>
    this.tsService.parseEpoch(this.epochInput(), this.unit(), this.autoDetect())
  );
  private parsedEpochMs = computed(() => this.epochConversion().ms);
  epochError = computed(() => this.epochConversion().error);

  localOut = computed(() => this.tsService.formatMs(this.parsedEpochMs(), 'local'));
  utcOut = computed(() => this.tsService.formatMs(this.parsedEpochMs(), 'utc'));
  isoOut = computed(() => this.tsService.formatMs(this.parsedEpochMs(), 'iso'));

  // === Local -> Epoch Derived State ===
  private parsedLocalMs = computed(() => this.tsService.parseLocalDateTime(this.localInput()));
  epochFromLocal = computed(() => this.tsService.msToEpoch(this.parsedLocalMs(), this.unit()));
  tzOffsetStr = this.tsService.getTimezoneOffsetString();

  // === Actions ===
  setNow() {
    this.localInput.set(this.tsService.toDatetimeLocalValue(new Date()));
  }

  clearLocal() {
    this.localInput.set('');
  }

  async copy(value: string | null) {
    if (!value) return;
    const ok = await copyToClipboard(value);
    ok ? this.toast.success('Copied to clipboard') : this.toast.error('Copy failed');
  }
}
