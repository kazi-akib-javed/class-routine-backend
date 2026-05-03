export interface OverrideData {
  room?: string;
  note?: string;
  instruction?: string;
  cancelled?: boolean;
  postponed_to?: string;
}

export interface RawScheduleEntry {
  id: string;
  week_type: 'odd' | 'even';
  day: string;
  block: number;
  time_start: string;
  time_end: string;
  subject: string;
  subject_short: string;
  session_type: string;
  teachers: string[];
  room: string;
  target_groups: string[];
  description: string;
  note: string;
  instruction: string;
  nat_sci_ref: boolean;
  override: OverrideData | null;
}

export class ScheduleEntry {
  readonly id: string;
  readonly weekType: 'odd' | 'even';
  readonly day: string;
  readonly block: number;
  readonly timeStart: string;
  readonly timeEnd: string;
  readonly subject: string;
  readonly subjectShort: string;
  readonly sessionType: string;
  readonly teachers: string[];
  readonly room: string;
  readonly targetGroups: string[];
  readonly description: string;
  readonly note: string;
  readonly instruction: string;
  readonly natSciRef: boolean;
  // mutable: overrides can be applied after construction
  override: OverrideData | null;

  private constructor(raw: RawScheduleEntry) {
    this.id = raw.id;
    this.weekType = raw.week_type;
    this.day = raw.day;
    this.block = raw.block;
    this.timeStart = raw.time_start;
    this.timeEnd = raw.time_end;
    this.subject = raw.subject;
    this.subjectShort = raw.subject_short;
    this.sessionType = raw.session_type;
    this.teachers = raw.teachers;
    this.room = raw.room;
    this.targetGroups = raw.target_groups;
    this.description = raw.description;
    this.note = raw.note;
    this.instruction = raw.instruction;
    this.natSciRef = raw.nat_sci_ref;
    this.override = raw.override;
  }

  static fromJSON(raw: RawScheduleEntry): ScheduleEntry {
    return new ScheduleEntry(raw);
  }

  /**
   * Merges the given override data into this entry's current override.
   * Subsequent calls accumulate — later values win per field.
   */
  applyOverride(data: OverrideData): void {
    this.override = { ...(this.override ?? {}), ...data };
  }

  isCancelled(): boolean {
    return this.override?.cancelled === true;
  }

  effectiveRoom(): string {
    return this.override?.room ?? this.room;
  }

  effectiveNote(): string {
    return this.override?.note ?? this.note;
  }

  effectiveInstruction(): string {
    return this.override?.instruction ?? this.instruction;
  }

  /**
   * Returns true when the requested group is covered by this entry's targetGroups.
   * Matching rules (in order):
   *   1. targetGroups includes "all"
   *   2. Exact match: targetGroups includes requestedGroup
   *   3. Half-group match: a targetGroup is a prefix of requestedGroup (e.g. "Gr. 1" → "Gr. 1A")
   *   4. Parent match: requestedGroup is a prefix of a targetGroup (e.g. "Gr. 1" matches entry for "Gr. 1A")
   */
  matchesGroup(requestedGroup: string): boolean {
    if (this.targetGroups.includes('all')) return true;
    if (this.targetGroups.includes(requestedGroup)) return true;
    return this.targetGroups.some(
      (tg) => tg.startsWith(requestedGroup) || requestedGroup.startsWith(tg),
    );
  }
}
