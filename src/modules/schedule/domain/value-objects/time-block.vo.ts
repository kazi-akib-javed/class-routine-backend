/**
 * Value object representing a named time block (1–6) with its start/end times.
 */
export class TimeBlock {
  private constructor(
    public readonly block: number,
    public readonly timeStart: string,
    public readonly timeEnd: string,
  ) {}

  static of(block: number, timeStart: string, timeEnd: string): TimeBlock {
    if (block < 1 || block > 6) {
      throw new Error(`Invalid block number ${block}. Must be 1–6.`);
    }
    return new TimeBlock(block, timeStart, timeEnd);
  }

  static fromRawMap(
    block: number,
    timeBlocks: Record<string, { start: string; end: string }>,
  ): TimeBlock {
    const times = timeBlocks[String(block)];
    if (!times) {
      throw new Error(`No time data found for block ${block}.`);
    }
    return new TimeBlock(block, times.start, times.end);
  }

  equals(other: TimeBlock): boolean {
    return (
      this.block === other.block &&
      this.timeStart === other.timeStart &&
      this.timeEnd === other.timeEnd
    );
  }

  toString(): string {
    return `Block ${this.block} (${this.timeStart}–${this.timeEnd})`;
  }
}
