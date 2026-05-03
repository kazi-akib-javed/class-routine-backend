export type WeekParityType = 'odd' | 'even';

/**
 * Value object representing the parity (odd/even) of an ISO calendar week.
 *
 * Rule: CW15 (semester start, April 7 2026) = ODD.
 * Formula: (isoWeek % 2 === 15 % 2) ? 'odd' : 'even'
 */
export class WeekParity {
  private constructor(public readonly value: WeekParityType) {}

  static fromIsoWeek(isoWeek: number): WeekParity {
    return new WeekParity(isoWeek % 2 === 15 % 2 ? 'odd' : 'even');
  }

  static of(value: WeekParityType): WeekParity {
    return new WeekParity(value);
  }

  isOdd(): boolean {
    return this.value === 'odd';
  }

  isEven(): boolean {
    return this.value === 'even';
  }

  equals(other: WeekParity): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
