// ---------------------------------------------------------------------------
// Raw JSON shapes (as stored in data/schedule.json)
// ---------------------------------------------------------------------------

export interface RawNatSciSession {
  subject: string;
  session_type: string;
  time_slot: string;
  groups: string[];
  note?: string;
}

export interface RawNatSciWeek {
  cw: number;
  parity: 'odd' | 'even';
  tuesday_date: string;
  wednesday_date: string;
  lecture_free: boolean;
  note?: string;
  /** Single session or array – normalized to array on construction. */
  tuesday: RawNatSciSession | RawNatSciSession[];
  /** Single session or array – normalized to array on construction. */
  wednesday: RawNatSciSession | RawNatSciSession[];
}

// ---------------------------------------------------------------------------
// NatSciSession — value object
// ---------------------------------------------------------------------------

export class NatSciSession {
  readonly subject: string;
  readonly sessionType: string;
  readonly timeSlot: string;
  readonly groups: string[];
  readonly note: string;

  constructor(raw: RawNatSciSession) {
    this.subject = raw.subject;
    this.sessionType = raw.session_type;
    this.timeSlot = raw.time_slot;
    this.groups = raw.groups;
    this.note = raw.note ?? '';
  }

  /**
   * Returns true when the requested group is covered by this session's groups.
   * Rules (in priority order):
   *   1. groups includes "all"
   *   2. Exact match
   *   3. Prefix / half-group match — "Gr. 1" matches "Gr. 1A"; "Gr. 1A" matches entry for "Gr. 1"
   */
  matchesGroup(group: string): boolean {
    if (this.groups.includes('all')) return true;
    if (this.groups.includes(group)) return true;
    return this.groups.some(
      (g) => g.startsWith(group) || group.startsWith(g),
    );
  }
}

// ---------------------------------------------------------------------------
// NatSciWeek — entity
// ---------------------------------------------------------------------------

export class NatSciWeek {
  readonly cw: number;
  readonly parity: 'odd' | 'even';
  readonly tuesdayDate: string;
  readonly wednesdayDate: string;
  readonly lectureFree: boolean;
  readonly note: string;
  /** Always an array (normalised from single object or array in JSON). */
  readonly tuesday: NatSciSession[];
  /** Always an array (normalised from single object or array in JSON). */
  readonly wednesday: NatSciSession[];

  private constructor(raw: RawNatSciWeek) {
    this.cw = raw.cw;
    this.parity = raw.parity;
    this.tuesdayDate = raw.tuesday_date;
    this.wednesdayDate = raw.wednesday_date;
    this.lectureFree = raw.lecture_free;
    this.note = raw.note ?? '';
    this.tuesday = NatSciWeek.normaliseSessions(raw.tuesday);
    this.wednesday = NatSciWeek.normaliseSessions(raw.wednesday);
  }

  static fromJSON(raw: RawNatSciWeek): NatSciWeek {
    return new NatSciWeek(raw);
  }

  /**
   * Returns sessions for the given day, optionally filtered by group.
   * Day must be "Tuesday" or "Wednesday" (case-insensitive).
   * If group is omitted all sessions for the day are returned.
   */
  getSessionsForDay(day: string, group?: string): NatSciSession[] {
    const key = day.toLowerCase();
    let sessions: NatSciSession[];

    if (key === 'tuesday') {
      sessions = this.tuesday;
    } else if (key === 'wednesday') {
      sessions = this.wednesday;
    } else {
      return [];
    }

    if (!group) return sessions;
    return sessions.filter((s) => s.matchesGroup(group));
  }

  private static normaliseSessions(
    raw: RawNatSciSession | RawNatSciSession[],
  ): NatSciSession[] {
    if (!raw) return [];
    const arr = Array.isArray(raw) ? raw : [raw];
    return arr.map((r) => new NatSciSession(r));
  }
}
