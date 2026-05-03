import { randomUUID } from 'crypto';

export interface OverrideFields {
  room?: string;
  note?: string;
  instruction?: string;
  cancelled?: boolean;
  postponed_to?: string;
}

export interface RawOverride {
  id: string;
  entryId: string;
  date: string;
  room?: string;
  note?: string;
  instruction?: string;
  cancelled: boolean;
  postponed_to?: string;
}

export class Override {
  readonly id: string;
  readonly entryId: string;
  readonly date: string;
  readonly room?: string;
  readonly note?: string;
  readonly instruction?: string;
  readonly cancelled: boolean;
  readonly postponed_to?: string;

  private constructor(raw: RawOverride) {
    this.id = raw.id;
    this.entryId = raw.entryId;
    this.date = raw.date;
    this.room = raw.room;
    this.note = raw.note;
    this.instruction = raw.instruction;
    this.cancelled = raw.cancelled;
    this.postponed_to = raw.postponed_to;
  }

  /**
   * Factory used when creating a brand-new override from user input.
   * Generates a UUID for the id.
   */
  static create(entryId: string, date: string, fields: OverrideFields): Override {
    return new Override({
      id: randomUUID(),
      entryId,
      date,
      room: fields.room,
      note: fields.note,
      instruction: fields.instruction,
      cancelled: fields.cancelled ?? false,
      postponed_to: fields.postponed_to,
    });
  }

  /** Restores an Override from a plain JSON object (e.g. from disk). */
  static fromJSON(raw: RawOverride): Override {
    return new Override(raw);
  }

  toJSON(): RawOverride {
    return {
      id: this.id,
      entryId: this.entryId,
      date: this.date,
      room: this.room,
      note: this.note,
      instruction: this.instruction,
      cancelled: this.cancelled,
      postponed_to: this.postponed_to,
    };
  }

  /**
   * Returns the subset of fields that map directly onto a ScheduleEntry override slot.
   */
  toOverrideData(): OverrideFields & { cancelled: boolean } {
    return {
      room: this.room,
      note: this.note,
      instruction: this.instruction,
      cancelled: this.cancelled,
      postponed_to: this.postponed_to,
    };
  }
}
