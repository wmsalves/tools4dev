import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UuidService {
  generate(): string {
    if (
      typeof crypto !== 'undefined' &&
      'randomUUID' in crypto &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID();
    }
    const bytes = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    }

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex: string[] = [];
    for (let i = 0; i < 256; i++) hex[i] = (i + 0x100).toString(16).substring(1);

    return (
      hex[bytes[0]] +
      hex[bytes[1]] +
      hex[bytes[2]] +
      hex[bytes[3]] +
      '-' +
      hex[bytes[4]] +
      hex[bytes[5]] +
      '-' +
      hex[bytes[6]] +
      hex[bytes[7]] +
      '-' +
      hex[bytes[8]] +
      hex[bytes[9]] +
      '-' +
      hex[bytes[10]] +
      hex[bytes[11]] +
      hex[bytes[12]] +
      hex[bytes[13]] +
      hex[bytes[14]] +
      hex[bytes[15]]
    );
  }

  format(rawUuid: string, options: { uppercase: boolean; noHyphens: boolean }): string {
    let out = options.noHyphens ? rawUuid.replace(/-/g, '') : rawUuid;
    if (options.uppercase) {
      out = out.toUpperCase();
    }
    return out;
  }

  stripFormatting(formattedUuid: string): string {
    return formattedUuid.replace(/-/g, '');
  }
}
