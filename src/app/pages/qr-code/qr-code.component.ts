import { Component, ElementRef, ViewChild, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToolCardComponent } from '@shared/ui/tool-card/tool-card.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { BadgeComponent } from '@shared/ui/badge/badge.component';

import { copyToClipboard } from '@shared/utils/copy-to-clipboard';
import { downloadDataUrl } from '@shared/utils/download';

type Ecc = 'L' | 'M' | 'Q' | 'H';

@Component({
  standalone: true,
  selector: 'app-qr-code',
  imports: [
    CommonModule,
    FormsModule,
    ToolCardComponent,
    ButtonComponent,
    InputComponent,
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
            [model]="text()"
            [modelChange]="onTextChange"
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
                [(ngModel)]="sizeValue"
                (ngModelChange)="onSizeChange($event)"
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
                [(ngModel)]="marginValue"
                (ngModelChange)="onMarginChange($event)"
              />
            </div>

            <div class="field">
              <label for="ecc">Error Correction</label>
              <select id="ecc" [(ngModel)]="eccValue" (ngModelChange)="onEccChange($event)">
                <option value="L">L (Low)</option>
                <option value="M">M (Medium)</option>
                <option value="Q">Q (Quartile)</option>
                <option value="H">H (High)</option>
              </select>
            </div>
          </div>

          <div class="row">
            <ui-button (click)="render()">Generate</ui-button>
            <ui-button variant="outline" (click)="clear()">Clear</ui-button>
            <ui-badge *ngIf="status()" [variant]="status() === 'Ready' ? 'success' : ''">{{
              status()
            }}</ui-badge>
          </div>
        </div>

        <div class="col preview">
          <div class="canvas-wrap">
            <canvas #canvas width="{{ size() }}" height="{{ size() }}"></canvas>
          </div>

          <div class="row">
            <ui-button [disabled]="!dataUrl()" (click)="download()">Download PNG</ui-button>
            <ui-button [disabled]="!dataUrl()" variant="ghost" (click)="copyImage()"
              >Copy Image (Data URL)</ui-button
            >
            <ui-button [disabled]="!text()" variant="ghost" (click)="copyText()"
              >Copy Text</ui-button
            >
          </div>

          <small class="muted"
            >Tip: higher error correction (H) creates bigger codes but is more resilient.</small
          >
          <div *ngIf="error()" class="err">{{ error() }}</div>
        </div>
      </div>

      <div actions>
        <small class="muted"
          >PNG is generated client-side. Test scanning in different distances and lighting.</small
        >
      </div>
    </tool-card>
  `,
  styles: [
    `
      .grid {
        display: grid;
        gap: 16px;
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
        gap: 8px;
        flex-wrap: wrap;
      }
      .col {
        display: grid;
        gap: 12px;
      }
      .preview {
        align-content: start;
      }

      .field {
        display: grid;
        gap: 6px;
      }
      .field input,
      .field select {
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        outline: none;
        background: #fff;
      }
      .field input:focus,
      .field select:focus {
        border-color: #0f172a;
      }
      label {
        font-size: 14px;
        color: #6b7280;
      }

      .canvas-wrap {
        display: grid;
        place-items: center;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        width: 100%;
        padding: 12px;
      }
      canvas {
        display: block;
      }

      .muted {
        color: #6b7280;
      }
      .err {
        color: #7f1d1d;
        background: #fef2f2;
        border: 1px solid #dc2626;
        padding: 8px 10px;
        border-radius: 10px;
      }
    `,
  ],
})
export class QrCodeComponent {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // state
  text = signal<string>('');
  size = signal<number>(256);
  margin = signal<number>(2);
  ecc = signal<Ecc>('M');

  dataUrl = signal<string>('');
  error = signal<string>('');
  status = signal<'Idle' | 'Ready' | 'Rendering'>('Idle');

  // ngModel bridges
  sizeValue = this.size();
  marginValue = this.margin();
  eccValue: Ecc = this.ecc();

  onTextChange = (v: string) => this.text.set(v);
  onSizeChange(v: number) {
    this.size.set(this.clampNumber(+v, 64, 2048));
  }
  onMarginChange(v: number) {
    this.margin.set(this.clampNumber(+v, 0, 16));
  }
  onEccChange(v: Ecc) {
    this.ecc.set(v);
  }

  constructor() {
    effect(() => {
      // keep ngModel mirrors in sync if size/margin/ecc change from other places
      this.sizeValue = this.size();
      this.marginValue = this.margin();
      this.eccValue = this.ecc();
    });
  }

  private clampNumber(n: number, min: number, max: number) {
    if (Number.isNaN(n)) return min;
    return Math.min(max, Math.max(min, Math.floor(n)));
  }

  async render() {
    this.error.set('');
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const value = (this.text() || '').trim();
    if (!value) {
      this.status.set('Idle');
      this.dataUrl.set('');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    this.status.set('Rendering');

    try {
      // dynamic import avoids SSR bundling issues
      // @ts-ignore: No type declarations for 'qrcode'
      const QRCode = (await import('qrcode')).default;
      const opts = {
        errorCorrectionLevel: this.ecc(),
        width: this.size(),
        margin: this.margin(),
        // colors could be exposed later:
        color: { dark: '#000000', light: '#FFFFFF' },
      } as const;

      await QRCode.toCanvas(canvas, value, opts);
      this.dataUrl.set(canvas.toDataURL('image/png'));
      this.status.set('Ready');
    } catch (e: any) {
      this.status.set('Idle');
      this.dataUrl.set('');
      this.error.set(e?.message ?? 'Failed to render QR code.');
    }
  }

  async copyImage() {
    if (!this.dataUrl()) return;
    const ok = await copyToClipboard(this.dataUrl());
    if (!ok) this.error.set('Could not copy image data URL to clipboard.');
  }

  async copyText() {
    const v = this.text().trim();
    if (!v) return;
    const ok = await copyToClipboard(v);
    if (!ok) this.error.set('Could not copy text to clipboard.');
  }

  download() {
    if (!this.dataUrl()) return;
    downloadDataUrl(this.dataUrl(), 'qrcode.png');
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
