import { Component, ElementRef, ViewChild, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToolCardComponent } from '@shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { BadgeComponent } from '@shared/ui/badge/badge.component';

import { copyToClipboard } from '@shared/utils/copy-to-clipboard';
import { downloadDataUrl } from '@shared/utils/download';
import { ToastService } from '@app/shared/toast/toast.service';
import { QrCodeService } from '@app/core/services/qr-code.service';
import type { QRCodeErrorCorrectionLevel } from 'qrcode';

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
      <div class="grid">
        <div class="col">
          <ui-input
            id="qr-text"
            label="Content"
            placeholder="Type text or URL…"
            [(model)]="text"
          ></ui-input>

          <div class="row">
            <div class="field">
              <label for="size">Size (px)</label>
              <input
                id="size"
                type="number"
                min="64"
                max="2048"
                step="16"
                [ngModel]="size()"
                (ngModelChange)="setSize($event)"
              />
            </div>

            <div class="field">
              <label for="margin">Margin</label>
              <input
                id="margin"
                type="number"
                min="0"
                max="16"
                step="1"
                [ngModel]="margin()"
                (ngModelChange)="setMargin($event)"
              />
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

          <div class="btn-group">
            <ui-button (click)="render()">Generate</ui-button>
            <ui-button variant="secondary" (click)="clear()">Clear</ui-button>
            <ui-badge *ngIf="status()" [variant]="status() === 'Ready' ? 'success' : ''">{{
              status()
            }}</ui-badge>
          </div>
        </div>

        <div class="col preview">
          <div class="canvas-wrap">
            <canvas #canvas [width]="size()" [height]="size()"></canvas>
          </div>

          <div class="btn-group">
            <ui-button [disabled]="!dataUrl()" (click)="download()">Download PNG</ui-button>
            <ui-button variant="secondary" [disabled]="!dataUrl()" (click)="copy(dataUrl())"
              >Copy Image (Data URL)</ui-button
            >
            <ui-button variant="ghost" [disabled]="!text()" (click)="copy(text())"
              >Copy Text</ui-button
            >
          </div>

          <small class="muted"
            >Tip: higher error correction (H) creates bigger codes but is more resilient.</small
          >
          <div *ngIf="error()" class="err">{{ error() }}</div>
        </div>
      </div>
    </tool-card>
  `,
  styles: [
    `
      .grid {
        display: grid;
        gap: 24px;
        grid-template-columns: 1fr;
      }
      @media (min-width: 900px) {
        .grid {
          grid-template-columns: 1.4fr 1fr;
        }
      }
      .row {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .col {
        display: grid;
        gap: 16px;
        align-content: start;
      }
      .field {
        display: grid;
        gap: 6px;
      }
      label {
        font-size: 14px;
        color: var(--muted);
      }
      .canvas-wrap {
        display: grid;
        place-items: center;
        background: #fff;
        border-radius: 12px;
        padding: 16px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      canvas {
        display: block;
        max-width: 100%;
        height: auto;
      }
      .muted {
        color: var(--muted);
      }
      .err {
        color: #ffb3b3;
        font-weight: 500;
      }
    `,
  ],
})
export class QrCodeComponent {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private toast = inject(ToastService);
  private qrCodeService = inject(QrCodeService);

  // State Signals
  text = signal<string>('https://tools4dev.wmsalves.com');
  size = signal<number>(256);
  margin = signal<number>(2);
  ecc = signal<QRCodeErrorCorrectionLevel>('M');

  dataUrl = signal<string>('');
  error = signal<string>('');
  status = signal<'Idle' | 'Ready' | 'Rendering'>('Idle');

  // Input sanitization methods
  setSize(value: string | number) {
    this.size.set(this.clampNumber(Number(value), 64, 2048));
  }
  setMargin(value: string | number) {
    this.margin.set(this.clampNumber(Number(value), 0, 16));
  }
  private clampNumber(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, Math.floor(n || min)));
  }

  async render() {
    this.error.set('');
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const value = (this.text() || '').trim();
    if (!value) {
      this.clear();
      return;
    }

    this.status.set('Rendering');

    const result = await this.qrCodeService.generate(canvas, value, {
      errorCorrectionLevel: this.ecc(),
      width: this.size(),
      margin: this.margin(),
      color: { dark: '#000000', light: '#FFFFFF' },
    });

    if (result.dataUrl) {
      this.dataUrl.set(result.dataUrl);
      this.status.set('Ready');
      this.toast.success('QR code generated');
    } else {
      this.dataUrl.set('');
      this.status.set('Idle');
      this.error.set(result.error ?? 'An unknown error occurred.');
      this.toast.error(result.error ?? 'Failed to render QR code.');
    }
  }

  async copy(value: string | null) {
    if (!value) return;
    const ok = await copyToClipboard(value);
    ok ? this.toast.success('Copied to clipboard') : this.toast.error('Could not copy');
  }

  download() {
    if (!this.dataUrl()) return;
    downloadDataUrl(this.dataUrl(), 'qrcode.png');
    this.toast.info('Downloading PNG…');
  }

  clear() {
    this.text.set('');
    this.dataUrl.set('');
    this.error.set('');
    this.status.set('Idle');
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
