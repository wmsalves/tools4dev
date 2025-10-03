import { Injectable } from '@angular/core';
import type { QRCodeErrorCorrectionLevel } from 'qrcode';

export interface QrCodeCanvasOptions {
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export interface QrCodeResult {
  dataUrl: string | null;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class QrCodeService {
  async generate(
    canvas: HTMLCanvasElement,
    text: string,
    options: QrCodeCanvasOptions
  ): Promise<QrCodeResult> {
    try {
      const QRCode = (await import('qrcode')).default;
      await QRCode.toCanvas(canvas, text, options);
      return {
        dataUrl: canvas.toDataURL('image/png'),
        error: null,
      };
    } catch (e: any) {
      const message = e?.message ?? 'Failed to render QR code.';
      console.error('QR Code Generation Error:', e);
      return {
        dataUrl: null,
        error: message,
      };
    }
  }
}
