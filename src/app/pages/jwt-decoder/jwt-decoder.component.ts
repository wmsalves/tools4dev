import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JwtDecoderService, DecodedJwt } from '@app/core/services/jwt-decoder.service';
import { ToolCardComponent } from '@shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { copyToClipboard } from '@shared/utils/copy-to-clipboard';
import { ToastService } from '@app/shared/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-jwt-decoder',
  imports: [CommonModule, FormsModule, ToolCardComponent, ButtonComponent, JsonPipe],
  template: `
    <tool-card
      [title]="'JWT Decoder'"
      [subtitle]="'Paste a JSON Web Token to decode and inspect its contents.'"
      [hasActions]="true"
    >
      <div class="decoder-layout">
        <div class="field">
          <label for="jwt-token">Encoded JWT</label>
          <textarea
            id="jwt-token"
            class="editor"
            placeholder="Paste your JWT here..."
            [(ngModel)]="token"
            rows="8"
          ></textarea>
        </div>

        <div *ngIf="decodedResult().error" class="err-box">
          {{ decodedResult().error }}
        </div>

        <div *ngIf="decodedResult().payload" class="results-grid">
          <!-- Header -->
          <div class="result-section">
            <h3>Header</h3>
            <pre class="code-box header-code">{{ decodedResult().header | json }}</pre>
          </div>

          <!-- Payload -->
          <div class="result-section">
            <h3>Payload</h3>
            <div *ngIf="isExpired()" class="expiry-warning">Token has expired!</div>
            <pre class="code-box payload-code" [class.expired]="isExpired()">{{
              decodedResult().payload | json
            }}</pre>
          </div>
        </div>
      </div>

      <div actions>
        <div class="btn-group">
          <ui-button (click)="copyPayload()" [disabled]="!decodedResult().payload"
            >Copy Payload</ui-button
          >
          <ui-button (click)="clear()" variant="secondary">Clear</ui-button>
        </div>
      </div>
    </tool-card>
  `,
  styles: [
    `
      .decoder-layout {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .editor {
        width: 100%;
        resize: vertical;
        font-family: var(--font-mono);
        font-size: 0.9rem;
        border: 1px solid var(--glass);
        transition: border-color 0.2s ease;
      }
      .editor:focus {
        border-color: var(--accent-2);
      }
      .results-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
      }
      @media (min-width: 768px) {
        .results-grid {
          grid-template-columns: 1fr 2fr;
        }
      }
      .result-section h3 {
        margin-bottom: 8px;
        color: var(--muted);
      }
      .code-box {
        padding: 16px;
        border-radius: 8px;
        white-space: pre-wrap;
        word-break: break-all;
        font-size: 0.85rem;
        line-height: 1.6;
        min-height: 150px;
      }
      .header-code {
        background-color: rgba(239, 68, 68, 0.08); /* Red tint */
        border: 1px solid rgba(239, 68, 68, 0.2);
        color: #fca5a5;
      }
      .payload-code {
        background-color: rgba(168, 85, 247, 0.08); /* Purple tint */
        border: 1px solid rgba(168, 85, 247, 0.2);
        color: #d8b4fe;
      }
      .payload-code.expired {
        border-color: #facc15;
      }
      .expiry-warning {
        background-color: #facc15;
        color: #422006;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 700;
        margin-bottom: 8px;
        display: inline-block;
      }
      .err-box {
        color: #ffb3b3;
        background: rgba(255, 107, 107, 0.08);
        border: 1px solid rgba(255, 107, 107, 0.24);
        padding: 12px;
        border-radius: 8px;
      }
      .btn-group {
        display: flex;
        gap: 12px;
      }
    `,
  ],
})
export class JwtDecoderComponent {
  private jwtService = inject(JwtDecoderService);
  private toast = inject(ToastService);

  token = signal<string>('');
  decodedResult = computed(() => this.jwtService.decode(this.token()));
  isExpired = computed(() => (this.decodedResult().payload as any)?.isExpired === true);

  async copyPayload() {
    const payload = this.decodedResult().payload;
    if (payload) {
      const ok = await copyToClipboard(JSON.stringify(payload, null, 2));
      ok ? this.toast.success('Payload copied') : this.toast.error('Failed to copy');
    }
  }

  clear() {
    this.token.set('');
    this.toast.info('Cleared');
  }
}
