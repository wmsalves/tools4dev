import { Component, ElementRef, ViewChild, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QrCodeService } from '@app/core/services/qr-code.service';
import { ToolCardComponent } from '@shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { copyToClipboard } from '@shared/utils/copy-to-clipboard';
import { downloadDataUrl } from '@shared/utils/download';
import { ToastService } from '@app/shared/toast/toast.service';
import { QrCodeCanvasOptions } from '@app/core/services/qr-code.service';

@Component({
  standalone: true,
  selector: 'app-qr-code',
  imports: [
    CommonModule,
    FormsModule,
    ToolCardComponent,
    InputComponent,
    ButtonComponent,
    BadgeComponent,
  ],
  template: `
    <tool-card
      title="QR Code Generator"
      subtitle="Generate QR codes from text/URLs with size, margin and error correction options."
      [hasActions]="true"
    >
      <div class="grid-layout">
        <!-- Coluna de Opções -->
        <div class="options-col">
          <div class="form-group">
            <div class="field">
              <ui-input
                id="qr-text"
                label="Content"
                placeholder="Type text or URL…"
                [(model)]="text"
              ></ui-input>
            </div>

            <div class="form-row">
              <div class="field">
                <label for="size">Size (px)</label>
                <input id="size" type="number" min="64" max="2048" step="16" [(ngModel)]="size" />
              </div>
              <div class="field">
                <label for="margin">Margin</label>
                <input id="margin" type="number" min="0" max="16" step="1" [(ngModel)]="margin" />
              </div>
              <div class="field">
                <label for="ecc">Error Correction</label>
                <select id="ecc" [(ngModel)]="ecc">
                  <option value="L">L (Low)</option>
                  <option value="M">M (Medium)</option>
                  <option value="Q">Q (Quartile)</option>
                  <option value="H">H (High)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="btn-group">
                <ui-button (click)="render()">Generate</ui-button>
                <ui-button variant="secondary" (click)="clear()">Clear</ui-button>
              </div>
              <ui-badge *ngIf="status()" [variant]="status() === 'Ready' ? 'success' : ''">
                {{ status() }}
              </ui-badge>
            </div>
          </div>
        </div>

        <!-- Coluna de Preview -->
        <div class="preview-col">
          <div class="canvas-wrap">
            <canvas #canvas [width]="size()" [height]="size()"></canvas>
          </div>
          <div class="btn-group">
            <ui-button size="sm" [disabled]="!dataUrl()" (click)="download()"
              >Download PNG</ui-button
            >
            <ui-button size="sm" variant="secondary" [disabled]="!dataUrl()" (click)="copyImage()"
              >Copy Image</ui-button
            >
          </div>
          <div *ngIf="error()" class="err">{{ error() }}</div>
        </div>
      </div>

      <div actions>
        <small class="muted"
          >Tip: higher error correction (H) creates bigger codes but is more resilient.</small
        >
      </div>
    </tool-card>
  `,
  styles: [
    `
      .grid-layout {
        display: grid;
        gap: 32px;
        grid-template-columns: 1fr;
      }
      @media (min-width: 900px) {
        .grid-layout {
          grid-template-columns: 1.5fr 1fr;
        }
      }

      /* --- Estrutura de Layout do Formulário --- */
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .form-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 16px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex-grow: 1; /* Faz os campos preencherem o espaço */
      }
      .field input,
      .field select {
        width: 100%; /* Ocupa toda a largura do .field */
      }
      .btn-group {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
      }

      /* --- Colunas --- */
      .options-col,
      .preview-col {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .preview-col {
        align-items: center;
      }
      .canvas-wrap {
        display: grid;
        place-items: center;
        background: #fff;
        border: 1px solid var(--glass);
        border-radius: 12px;
        width: 100%;
        padding: 16px;
        aspect-ratio: 1 / 1; /* Garante que seja sempre um quadrado */
      }
      canvas {
        display: block;
        max-width: 100%;
        height: auto;
        object-fit: contain;
      }

      /* --- Estilos Visuais --- */
      .muted {
        color: var(--muted);
      }
      .err {
        color: #ffb3b3;
        background: rgba(255, 107, 107, 0.08);
        border: 1px solid rgba(255, 107, 107, 0.24);
        padding: 8px 12px;
        border-radius: 10px;
        font-size: 14px;
        width: 100%;
      }
    `,
  ],
})
export class QrCodeComponent {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private qrCodeService = inject(QrCodeService);
  private toast = inject(ToastService);

  // state
  text = signal<string>('');
  size = signal<number>(256);
  margin = signal<number>(2);
  ecc = signal<'L' | 'M' | 'Q' | 'H'>('M');
  dataUrl = signal<string>('');
  error = signal<string>('');
  status = signal<'Idle' | 'Ready' | 'Rendering'>('Idle');

  // actions
  async render() {
    this.error.set('');
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const value = this.text().trim();
    if (!value) {
      this.clearCanvas();
      return;
    }

    this.status.set('Rendering');

    const options: QrCodeCanvasOptions = {
      width: this.size(),
      margin: this.margin(),
      errorCorrectionLevel: this.ecc(),
      color: { dark: '#000000', light: '#FFFFFF' },
    };

    const result = await this.qrCodeService.generate(canvas, value, options);

    if (result.dataUrl) {
      this.dataUrl.set(result.dataUrl);
      this.status.set('Ready');
      this.toast.success('QR code generated');
    } else {
      this.dataUrl.set('');
      this.status.set('Idle');
      this.error.set(result.error ?? 'Failed to render QR code.');
      this.toast.error(result.error ?? 'Failed to render QR code.');
    }
  }

  async copyImage() {
    if (!this.dataUrl()) return;
    const ok = await copyToClipboard(this.dataUrl());
    ok
      ? this.toast.success('Image data URL copied')
      : this.toast.error('Could not copy image data URL');
  }

  download() {
    if (!this.dataUrl()) return;
    downloadDataUrl(this.dataUrl(), 'qrcode.png');
    this.toast.info('Downloading PNG…');
  }

  clear() {
    this.text.set('');
    this.clearCanvas();
    this.toast.info('Cleared');
  }

  private clearCanvas() {
    this.dataUrl.set('');
    this.error.set('');
    this.status.set('Idle');
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
