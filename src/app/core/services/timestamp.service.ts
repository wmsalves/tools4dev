import { Injectable } from '@angular/core';

export type Unit = 'seconds' | 'milliseconds';

export interface EpochConversionResult {
  ms: number | null;
  error: string;
}

@Injectable({
  providedIn: 'root',
})
export class TimestampService {
  parseEpoch(epochValue: string, unit: Unit, autoDetect: boolean): EpochConversionResult {
    const raw = (epochValue || '').trim();
    if (!raw) return { ms: null, error: '' };

    const cleaned = raw.replace(/[\s_]/g, '').replace(',', '.');
    const n = Number(cleaned);

    if (!Number.isFinite(n)) {
      return { ms: null, error: 'Invalid number.' };
    }

    const isLikelyMs = Math.abs(n) >= 1e12 || /^\d{12,}$/.test(cleaned);
    let ms: number;

    if (autoDetect && isLikelyMs) {
      ms = Math.trunc(n);
    } else {
      ms = unit === 'seconds' ? n * 1000 : Math.trunc(n);
    }

    if (unit === 'seconds') {
      ms = Math.round(ms);
    }

    if (!Number.isFinite(ms) || Math.abs(ms) > 8.64e15) {
      return { ms: null, error: 'Timestamp is out of the supported range.' };
    }

    try {
      new Date(ms).toISOString();
      return { ms, error: '' };
    } catch {
      return { ms: null, error: 'Invalid timestamp.' };
    }
  }

  parseLocalDateTime(localValue: string): number | null {
    const v = (localValue || '').trim();
    if (!v) return null;

    const ms = new Date(v).getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  formatMs(ms: number | null, format: 'local' | 'utc' | 'iso'): string {
    if (ms === null) return '';
    try {
      const date = new Date(ms);
      switch (format) {
        case 'local':
          return date.toLocaleString();
        case 'utc':
          return date.toUTCString();
        case 'iso':
          return date.toISOString();
        default:
          return '';
      }
    } catch {
      return 'Invalid Date';
    }
  }

  msToEpoch(ms: number | null, unit: Unit): string | null {
    if (ms === null) return null;
    return unit === 'seconds' ? String(ms / 1000) : String(ms);
  }

  getTimezoneOffsetString(): string {
    const minutes = -new Date().getTimezoneOffset();
    const sign = minutes >= 0 ? '+' : '-';
    const abs = Math.abs(minutes);
    const hh = String(Math.floor(abs / 60)).padStart(2, '0');
    const mm = String(abs % 60).padStart(2, '0');
    return `UTC${sign}${hh}:${mm}`;
  }

  toDatetimeLocalValue(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  }
}
