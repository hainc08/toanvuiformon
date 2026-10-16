/** Pure helpers used to independently verify seeded answers (also unit-tested). */

export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const lcm = (a: number, b: number): number => Math.abs(a * b) / gcd(a, b);
export const gcdMany = (...xs: number[]): number => xs.reduce((acc, x) => gcd(acc, x));
export const lcmMany = (...xs: number[]): number => xs.reduce((acc, x) => lcm(acc, x));

export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

export function divisors(n: number): number[] {
  const out: number[] = [];
  for (let d = 1; d <= n; d++) if (n % d === 0) out.push(d);
  return out;
}

/** Prime factorisation as a map prime → exponent. */
export function factorize(n: number): Record<number, number> {
  const out: Record<number, number> = {};
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    while (m % p === 0) {
      out[p] = (out[p] ?? 0) + 1;
      m /= p;
    }
  }
  if (m > 1) out[m] = (out[m] ?? 0) + 1;
  return out;
}

export const sameFactorization = (a: Record<number, number>, b: Record<number, number>): boolean =>
  JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());

export const range = (from: number, to: number): number[] =>
  Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

export const sameList = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((x, i) => x === b[i]);

export const digitSum = (n: number): number =>
  String(Math.abs(n))
    .split("")
    .reduce((s, d) => s + Number(d), 0);

export function toRoman(n: number): string {
  const table: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let m = n;
  let out = "";
  for (const [v, s] of table) {
    while (m >= v) {
      out += s;
      m -= v;
    }
  }
  return out;
}

/** Exact rational arithmetic for fraction questions. */
export type Frac = readonly [number, number];
export const frac = (n: number, d: number): Frac => {
  const g = gcd(n, d) || 1;
  const sign = d < 0 ? -1 : 1;
  return [(sign * n) / g, (sign * d) / g];
};
export const fadd = (a: Frac, b: Frac): Frac => frac(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
export const fsub = (a: Frac, b: Frac): Frac => frac(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
export const fmul = (a: Frac, b: Frac): Frac => frac(a[0] * b[0], a[1] * b[1]);
export const fdiv = (a: Frac, b: Frac): Frac => frac(a[0] * b[1], a[1] * b[0]);
export const feq = (a: Frac, b: Frac): boolean => {
  const x = frac(a[0], a[1]);
  const y = frac(b[0], b[1]);
  return x[0] === y[0] && x[1] === y[1];
};
export const fcmp = (a: Frac, b: Frac): number => a[0] * b[1] - b[0] * a[1];

/** Decimal equality tolerant of binary floating-point noise. */
export const deq = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9;
export const roundTo = (x: number, digits: number): number => {
  const f = 10 ** digits;
  return Math.round((x + Number.EPSILON) * f) / f;
};
