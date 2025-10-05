import { Injectable } from '@angular/core';

export interface DecodedJwt {
  header: object | null;
  payload: object | null;
  signature: string | null;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class JwtDecoderService {
  decode(token: string): DecodedJwt {
    if (!token || !token.trim()) {
      return { header: null, payload: null, signature: null, error: null };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        header: null,
        payload: null,
        signature: null,
        error: 'Invalid JWT: O token deve conter 3 partes separadas por pontos.',
      };
    }

    try {
      const header = this.decodePart(parts[0]);
      const payload = this.decodePart(parts[1]);
      const signature = parts[2];

      if (payload && typeof (payload as any).exp === 'number') {
        const expiryDate = new Date((payload as any).exp * 1000);
        if (expiryDate < new Date()) {
          (payload as any).isExpired = true;
        }
      }

      return { header, payload, signature, error: null };
    } catch (e: any) {
      return {
        header: null,
        payload: null,
        signature: null,
        error: `Token inválido: ${e.message}`,
      };
    }
  }

  private decodePart(base64Url: string): object {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
      if (pad === 2) {
        base64 += '==';
      } else if (pad === 3) {
        base64 += '=';
      }
    }
    const decoded = atob(base64);
    return JSON.parse(decoded);
  }
}
