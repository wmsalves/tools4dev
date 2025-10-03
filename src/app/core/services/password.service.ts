import { Injectable } from '@angular/core';

export type GenCfg = {
  len: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  avoidAmbiguous: boolean;
};

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = `!@#$%^&*()_+-=[]{}|;:,.<>?/~`;
const AMBIGUOUS = new Set('O0oIl1|I5S2Z');

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  generate(cfg: GenCfg): string {
    return generatePassword(cfg);
  }

  estimateEntropy(cfg: GenCfg): number {
    return estimateEntropyBits(cfg);
  }
}

function secureRandomInt(maxExclusive: number): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
    let x = a[0];
    while (x >= limit) {
      crypto.getRandomValues(a);
      x = a[0];
    }
    return x % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

function pickFrom(chars: string): string {
  return chars[secureRandomInt(chars.length)];
}

function buildAlphabet({
  lower,
  upper,
  digits,
  symbols,
  avoidAmbiguous,
}: Omit<GenCfg, 'len'>): string {
  let pool = '';
  if (lower) pool += LOWER;
  if (upper) pool += UPPER;
  if (digits) pool += DIGITS;
  if (symbols) pool += SYMBOLS;
  if (!pool) throw new Error('Select at least one character set');

  if (avoidAmbiguous) {
    pool = Array.from(pool)
      .filter((ch) => !AMBIGUOUS.has(ch))
      .join('');
  }
  if (!pool) throw new Error('Character pool empty after removing ambiguous characters');

  return pool;
}

function generatePassword(cfg: GenCfg): string {
  const { len, lower, upper, digits, symbols } = cfg;
  const pool = buildAlphabet(cfg);

  const required: string[] = [];
  if (lower)
    required.push(
      pickFrom(buildAlphabet({ ...cfg, lower: true, upper: false, digits: false, symbols: false }))
    );
  if (upper)
    required.push(
      pickFrom(buildAlphabet({ ...cfg, lower: false, upper: true, digits: false, symbols: false }))
    );
  if (digits)
    required.push(
      pickFrom(buildAlphabet({ ...cfg, lower: false, upper: false, digits: true, symbols: false }))
    );
  if (symbols)
    required.push(
      pickFrom(buildAlphabet({ ...cfg, lower: false, upper: false, digits: false, symbols: true }))
    );

  if (required.length > len) throw new Error('Length too small for selected constraints');

  const restLen = len - required.length;
  const rest = Array.from({ length: restLen }, () => pickFrom(pool));
  const arr = [...required, ...rest];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.join('');
}

function estimateEntropyBits(cfg: GenCfg): number {
  const pool = buildAlphabet(cfg);
  const N = pool.length;
  if (N === 0) return 0;
  return Math.round(cfg.len * Math.log2(N));
}
