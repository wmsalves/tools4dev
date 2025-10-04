import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JsonFormatterService } from '@app/core/services/json-formatter.service';
import { ToolCardComponent } from '@shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { copyToClipboard } from '@shared/utils/copy-to-clipboard';
import { ToastService } from '@app/shared/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-json-formatter',
  imports: [CommonModule, FormsModule, ToolCardComponent, ButtonComponent],
  template: `
    <tool-card
      [title]="'JSON Formatter & Validator'"
      [subtitle]="'Paste your JSON data to format, validate, or minify it.'"
      [hasActions]="true"
    >
      <div class="formatter-layout">
        <!-- Coluna de Entrada -->
        <div class="editor-pane">
          <textarea
            class="editor"
            placeholder="Paste your JSON here..."
            [(ngModel)]="rawJson"
            [class.invalid]="formatResult().error"
          ></textarea>
        </div>

        <!-- Coluna de Saída -->
        <div class="editor-pane">
          <textarea
            class="editor"
            [value]="formatResult().formattedJson ?? ''"
            readonly
            placeholder="Formatted JSON will appear here..."
          ></textarea>
        </div>
      </div>

      <div class="status-bar">
        <div *ngIf="formatResult().error" class="err-msg">
          {{ formatResult().error }}
        </div>
        <div *ngIf="!formatResult().error && rawJson()" class="success-msg">Valid JSON</div>
      </div>

      <div actions>
        <div class="btn-group">
          <ui-button (click)="format()" variant="primary">Format</ui-button>
          <ui-button (click)="copy()" [disabled]="!formatResult().formattedJson">Copy</ui-button>
          <ui-button (click)="clear()" variant="secondary">Clear</ui-button>
        </div>
      </div>
    </tool-card>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      tool-card {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
      }
      .formatter-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        flex-grow: 1;
        min-height: 400px;
      }
      .editor-pane {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .editor {
        width: 100%;
        height: 100%;
        resize: none;
        font-family: var(--font-mono);
        font-size: 0.9rem;
        border: 1px solid var(--glass);
        transition: border-color 0.2s ease;
      }
      .editor:focus {
        border-color: var(--accent);
      }
      .editor.invalid {
        border-color: #ef4444;
      }
      .status-bar {
        padding-top: 8px;
        min-height: 24px;
        font-size: 0.85rem;
      }
      .err-msg {
        color: #ffb3b3;
      }
      .success-msg {
        color: var(--accent);
      }
      .btn-group {
        display: flex;
        gap: 12px;
      }
    `,
  ],
})
export class JsonFormatterComponent {
  private jsonFormatter = inject(JsonFormatterService);
  private toast = inject(ToastService);

  rawJson = signal<string>('');

  formatResult = computed(() => {
    return this.jsonFormatter.format(this.rawJson());
  });

  format() {
    const result = this.formatResult();
    if (result.formattedJson !== null) {
      this.rawJson.set(result.formattedJson);
      this.toast.success('JSON Formatted');
    } else {
      this.toast.error('Invalid JSON');
    }
  }

  async copy() {
    const result = this.formatResult();
    if (result.formattedJson) {
      const ok = await copyToClipboard(result.formattedJson);
      ok ? this.toast.success('Copied to clipboard') : this.toast.error('Failed to copy');
    }
  }

  clear() {
    this.rawJson.set('');
    this.toast.info('Cleared');
  }
}
