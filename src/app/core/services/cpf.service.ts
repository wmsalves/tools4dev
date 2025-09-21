export type GenerateOptions = { formatted?: boolean };

export class CpfService {
  generate(opts: GenerateOptions = { formatted: true }): string {
    const n: number[] = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
    const d1 = this.calcDigit(n, 10);
    const d2 = this.calcDigit([...n, d1], 11);
    const digits = [...n, d1, d2].join('');
    return opts.formatted ? this.format(digits) : digits;
  }

  isValid(input: string): boolean {
    const cpf = this.unformat(input);
    if (!/^\d{11}$/.test(cpf)) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    const nums = cpf.split('').map(Number);
    const d1 = this.calcDigit(nums.slice(0, 9), 10);
    const d2 = this.calcDigit(nums.slice(0, 9).concat(d1), 11);
    return d1 === nums[9] && d2 === nums[10];
  }

  format(value: string): string {
    const v = this.unformat(value);
    if (v.length !== 11) return value;
    return `${v.substring(0, 3)}.${v.substring(3, 6)}.${v.substring(6, 9)}-${v.substring(9)}`;
  }

  unformat(value: string): string {
    return (value || '').replace(/\D+/g, '');
  }

  private calcDigit(nums: number[], weightStart: number): number {
    const sum = nums.reduce((acc, n, idx) => acc + n * (weightStart - idx), 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  }
}
