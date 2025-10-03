import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolCardComponent } from '../../shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { copyToClipboard } from '../../shared/utils/copy-to-clipboard';
import { ToastService } from '../../shared/toast/toast.service';
import { UuidService } from '@app/core/services/uuid.service';

@Component({
  standalone: true,
  selector: 'app-uuid',
  imports: [CommonModule, FormsModule, ToolCardComponent, ButtonComponent],
  template: `
    <tool-card
      [title]="'UUID Generator'"
      [subtitle]="'Generate RFC 4122 version 4 UUIDs.'"
      [hasActions]="true"
    >
      <div class="form-group">
        <div class="form-row">
          <div class="btn-group">
            <ui-button (click)="generateOne()">Generate</ui-button>
            <ui-button variant="secondary" [disabled]="!current()" (click)="copy(current())"
              >Copy</ui-button
            >
          </div>
        </div>
      </div>

      <div *ngIf="current(); else nores" class="result">
        <code class="code">{{ current() }}</code>
      </div>
      <ng-template #nores>
        <div class="result muted">No UUID generated yet.</div>
      </ng-template>

      <div class="hr"></div>

      <h3>Options</h3>
      <div class="form-group">
        <div class="form-row">
          <label class="checkbox-label">
            <input type="checkbox" [(ngModel)]="uppercase" />
            Uppercase
          </label>
          <label class="checkbox-label">
            <input type="checkbox" [(ngModel)]="noHyphens" />
            Remove hyphens
          </label>
        </div>
      </div>

      <div class="hr"></div>

      <h3>Bulk</h3>
      <div class="form-group">
        <div class="form-row">
          <div class="field">
            <label for="count">Count</label>
            <input id="count" type="number" min="1" max="1000" step="1" [(ngModel)]="count" />
          </div>

          <div class="btn-group">
            <ui-button (click)="generateMany()">Generate list</ui-button>
            <ui-button
              variant="secondary"
              [disabled]="!list().length"
              (click)="copy(list().join('\\n'))"
              >Copy list</ui-button
            >
          </div>
        </div>
        <span class="muted small" *ngIf="list().length">({{ list().length }} items)</span>
      </div>

      <pre *ngIf="list().length" class="list">{{ list().join('\\n') }}</pre>

      <div actions>
        <small class="muted"
          >Uses <code>crypto.randomUUID()</code> when available, with a secure fallback.</small
        >
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
        width: 120px;
      }
      .checkbox-label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--muted);
        cursor: pointer;
        user-select: none;
      }
      .btn-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
      }

      .result {
        margin: 16px 0;
      }
      .code {
        background: var(--panel);
        color: var(--text);
        padding: 8px 12px;
        border-radius: 8px;
        display: inline-block;
        border: 1px solid var(--glass);
        font-size: 1.1rem;
        letter-spacing: 0.5px;
      }
      .muted {
        color: var(--muted);
      }
      .small {
        font-size: 13px;
      }
      .hr {
        height: 1px;
        background: var(--glass);
        margin: 24px 0;
        border: none;
      }
      .list {
        margin-top: 16px;
        max-height: 300px;
        overflow: auto;
        background: var(--panel);
        border: 1px solid var(--glass);
        border-radius: 12px;
        padding: 12px;
        white-space: pre-wrap;
        word-break: break-all;
      }
    `,
  ],
})
export class UuidComponent {
  private toast = inject(ToastService);
  private uuidService = inject(UuidService);

  current = signal<string>('');
  list = signal<string[]>([]);
  uppercase = signal<boolean>(false);
  noHyphens = signal<boolean>(false);
  count = signal<number>(10);

  constructor() {
    effect(() => {
      const opts = { uppercase: this.uppercase(), noHyphens: this.noHyphens() };

      if (this.current()) {
        const raw = this.uuidService.stripFormatting(this.current());
        this.current.set(this.uuidService.format(raw, opts));
      }
      if (this.list().length) {
        this.list.update((items) =>
          items.map((s) => this.uuidService.format(this.uuidService.stripFormatting(s), opts))
        );
      }
    });
  }

  generateOne() {
    const raw = this.uuidService.generate();
    this.current.set(this.formatUuid(raw));
    this.toast.success('UUID generated');
  }

  generateMany() {
    const n = this.count();
    const arr = Array.from({ length: n }, () => this.formatUuid(this.uuidService.generate()));
    this.list.set(arr);
    this.toast.success(`Generated ${n} UUID${n > 1 ? 's' : ''}`);
  }

  async copy(value: string | null) {
    if (!value) return;
    const ok = await copyToClipboard(value);
    ok ? this.toast.success('Copied to clipboard') : this.toast.error('Copy failed');
  }

  private formatUuid(raw: string): string {
    return this.uuidService.format(raw, {
      uppercase: this.uppercase(),
      noHyphens: this.noHyphens(),
    });
  }
}
