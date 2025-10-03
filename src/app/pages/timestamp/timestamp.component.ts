import {
  Component,
  signal,
  computed,
  inject,
  ChangeDetectorRef,
  afterNextRender,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimestampService, Unit } from '@app/core/services/timestamp.service';
import { ToolCardComponent } from '@shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { copyToClipboard } from '@shared/utils/copy-to-clipboard';
import { ToastService } from '@app/shared/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-timestamp',
  imports: [CommonModule, FormsModule, ToolCardComponent, ButtonComponent, BadgeComponent],
  template: `
    <tool-card
      [title]="'Timestamp Converter'"
      [subtitle]="'Convert between Unix epoch and local date/time.'"
      [hasActions]="true"
    >
      <h3>Epoch → Local</h3>
      <div class="form-group">
        <div class="form-row">
          <div class="field">
            <label for="epoch">Epoch</label>
            <input
              id="epoch"
              name="epoch"
              type="text"
              placeholder="e.g. 1732567890 or 1732567890123"
              [(ngModel)]="epochInput"
            />
          </div>
          <div class="field">
            <label>Unit</label>
            <div class="radio-group">
              <label
                ><input type="radio" name="unit" value="seconds" [(ngModel)]="unit" />
                Seconds</label
              >
              <label
                ><input type="radio" name="unit" value="milliseconds" [(ngModel)]="unit" />
                Milliseconds</label
              >
            </div>
          </div>
        </div>
        <div class="form-row">
          <label class="checkbox-label">
            <input type="checkbox" name="autoDetect" [(ngModel)]="autoDetect" />
            Auto-detect ms
          </label>
        </div>
      </div>
      <div class="info-box">
        <div><strong>Local:</strong> {{ localOut() || '—' }}</div>
        <div><strong>UTC:</strong> {{ utcOut() || '—' }}</div>
        <div class="small muted" *ngIf="isoOut()">
          ISO (UTC): <code class="code">{{ isoOut() }}</code>
        </div>
        <div class="err" *ngIf="errorMsg()">{{ errorMsg() }}</div>
      </div>

      <div class="hr"></div>

      <h3>Local → Epoch</h3>
      <div class="form-group">
        <div class="form-row">
          <div class="field">
            <label for="dt">Local date/time</label>
            <input id="dt" name="dt" type="datetime-local" [(ngModel)]="localInput" />
          </div>
          <div class="field">
            <label>Unit</label>
            <div class="radio-group">
              <label
                ><input type="radio" name="unit2" value="seconds" [(ngModel)]="unit" />
                Seconds</label
              >
              <label
                ><input type="radio" name="unit2" value="milliseconds" [(ngModel)]="unit" />
                Milliseconds</label
              >
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="btn-group">
            <ui-button (click)="setNow()">Now</ui-button>
            <ui-button
              variant="secondary"
              (click)="copyEpochFromLocal()"
              [disabled]="epochFromLocal() == null"
              >Copy Epoch</ui-button
            >
          </div>
        </div>
      </div>
      <div class="info-box">
        <div>
          <strong>Epoch:</strong>
          <code class="code">{{ epochFromLocal() ?? '—' }}</code>
          <ui-badge *ngIf="epochFromLocal() != null" variant="success">{{ unit() }}</ui-badge>
        </div>
        <div class="muted small">TZ offset: {{ tzOffsetStr() }}</div>
      </div>

      <div actions>
        <small class="muted">
          When “Auto-detect ms” is on, long numbers (≥ 1e12) are treated as milliseconds.
        </small>
      </div>
    </tool-card>
  `,
  styles: [
    `
      h3 {
        margin-bottom: 12px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .form-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 20px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1 1 200px;
      }
      .radio-group,
      .checkbox-label {
        display: flex;
        gap: 16px;
        align-items: center;
        height: 41px;
      }
      .radio-group label,
      .checkbox-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--muted);
        cursor: pointer;
      }
      .btn-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
      }
      .info-box {
        margin-top: 16px;
        padding: 12px;
        border: 1px solid var(--glass);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
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
        border: 1px solid var(--glass);
      }
      .err {
        color: #ffb3b3;
        background: rgba(255, 107, 107, 0.08);
        border: 1px solid rgba(255, 107, 107, 0.24);
        padding: 8px 12px;
        border-radius: 10px;
      }
      .hr {
        height: 1px;
        background: var(--glass);
        margin: 24px 0;
        border: none;
      }
    `,
  ],
})
export class TimestampComponent implements OnInit {
  private toast = inject(ToastService);
  private timestampService = inject(TimestampService);
  private cdr = inject(ChangeDetectorRef);

  epochInput = signal<string>('');
  localInput = signal<string>('');
  unit = signal<Unit>('seconds');
  autoDetect = signal<boolean>(true);

  constructor() {
    afterNextRender(() => {
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.setNow();
    const epochNow = this.epochFromLocal();
    if (epochNow) {
      this.epochInput.set(epochNow);
    }
  }

  private epochConversionResult = computed(() => {
    return this.timestampService.parseEpoch(this.epochInput(), this.unit(), this.autoDetect());
  });
  private parsedEpochMs = computed(() => this.epochConversionResult().ms);
  errorMsg = computed(() => this.epochConversionResult().error);
  localOut = computed(() => this.timestampService.formatMs(this.parsedEpochMs(), 'local'));
  utcOut = computed(() => this.timestampService.formatMs(this.parsedEpochMs(), 'utc'));
  isoOut = computed(() => this.timestampService.formatMs(this.parsedEpochMs(), 'iso'));
  epochFromLocal = computed(() => {
    const ms = this.timestampService.parseLocalDateTime(this.localInput());
    return this.timestampService.msToEpoch(ms, this.unit());
  });
  tzOffsetStr = computed(() => this.timestampService.getTimezoneOffsetString());

  setNow() {
    this.localInput.set(this.timestampService.toDatetimeLocalValue(new Date()));
  }

  async copyEpochFromLocal() {
    const v = this.epochFromLocal();
    if (v == null) return;
    const ok = await copyToClipboard(String(v));
    ok ? this.toast.success('Epoch copied') : this.toast.error('Copy failed');
  }
}
