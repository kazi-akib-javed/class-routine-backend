import { ResolveWeekUseCase, DaySchedule } from './resolve-week.usecase';
import { ResolveDayUseCase } from './resolve-day.usecase';
import { ScheduleEntry, RawScheduleEntry } from '../../domain/entities/schedule-entry.entity';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRawEntry(overrides: Partial<RawScheduleEntry> = {}): RawScheduleEntry {
  return {
    id: 'odd-mon-b1-math-lec',
    week_type: 'odd',
    day: 'Monday',
    block: 1,
    time_start: '08:15',
    time_end: '09:45',
    subject: 'Mathematics',
    subject_short: 'MATH',
    session_type: 'lecture',
    teachers: ['Dr. Smith'],
    room: 'A101',
    target_groups: ['all'],
    description: '',
    note: '',
    instruction: '',
    nat_sci_ref: false,
    override: null,
    ...overrides,
  };
}

function makeEntry(overrides: Partial<RawScheduleEntry> = {}): ScheduleEntry {
  return ScheduleEntry.fromJSON(makeRawEntry(overrides));
}

function mockResolveDayUseCase(
  entriesPerDay: ScheduleEntry[] = [],
): jest.Mocked<Pick<ResolveDayUseCase, 'execute'>> {
  return {
    execute: jest.fn().mockResolvedValue(entriesPerDay),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ResolveWeekUseCase', () => {
  describe('execute()', () => {
    it('calls ResolveDayUseCase.execute for each weekday (Mon–Fri)', async () => {
      const mockDay = mockResolveDayUseCase([]);
      const useCase = new ResolveWeekUseCase(mockDay as unknown as ResolveDayUseCase);

      // April 7 2026 = Tuesday (CW15)
      await useCase.execute({ date: '2026-04-07', group: 'Gr. 1' });

      expect(mockDay.execute).toHaveBeenCalledTimes(5);
    });

    it('derives correct Mon–Fri dates from a Tuesday input', async () => {
      const mockDay = mockResolveDayUseCase([]);
      const useCase = new ResolveWeekUseCase(mockDay as unknown as ResolveDayUseCase);

      // April 7 is Tuesday → Mon Apr 6 … Fri Apr 10
      await useCase.execute({ date: '2026-04-07', group: 'Gr. 1' });

      const calledDates = (mockDay.execute as jest.Mock).mock.calls.map(([input]) => input.date);
      expect(calledDates).toEqual([
        '2026-04-06',
        '2026-04-07',
        '2026-04-08',
        '2026-04-09',
        '2026-04-10',
      ]);
    });

    it('derives correct Mon–Fri dates from a Monday input', async () => {
      const mockDay = mockResolveDayUseCase([]);
      const useCase = new ResolveWeekUseCase(mockDay as unknown as ResolveDayUseCase);

      // April 13 is Monday (CW16)
      await useCase.execute({ date: '2026-04-13', group: 'Gr. 1' });

      const calledDates = (mockDay.execute as jest.Mock).mock.calls.map(([input]) => input.date);
      expect(calledDates).toEqual([
        '2026-04-13',
        '2026-04-14',
        '2026-04-15',
        '2026-04-16',
        '2026-04-17',
      ]);
    });

    it('derives correct Mon–Fri dates from a Friday input', async () => {
      const mockDay = mockResolveDayUseCase([]);
      const useCase = new ResolveWeekUseCase(mockDay as unknown as ResolveDayUseCase);

      // April 10 is Friday (CW15)
      await useCase.execute({ date: '2026-04-10', group: 'Gr. 1' });

      const calledDates = (mockDay.execute as jest.Mock).mock.calls.map(([input]) => input.date);
      expect(calledDates).toEqual([
        '2026-04-06',
        '2026-04-07',
        '2026-04-08',
        '2026-04-09',
        '2026-04-10',
      ]);
    });

    it('passes the requested group to every ResolveDayUseCase.execute call', async () => {
      const mockDay = mockResolveDayUseCase([]);
      const useCase = new ResolveWeekUseCase(mockDay as unknown as ResolveDayUseCase);

      await useCase.execute({ date: '2026-04-07', group: 'Gr. 2' });

      const calledGroups = (mockDay.execute as jest.Mock).mock.calls.map(([input]) => input.group);
      expect(calledGroups).toEqual(['Gr. 2', 'Gr. 2', 'Gr. 2', 'Gr. 2', 'Gr. 2']);
    });

    it('returns an array of exactly 5 DaySchedule objects', async () => {
      const mockDay = mockResolveDayUseCase([]);
      const useCase = new ResolveWeekUseCase(mockDay as unknown as ResolveDayUseCase);

      const result = await useCase.execute({ date: '2026-04-07', group: 'Gr. 1' });

      expect(result).toHaveLength(5);
    });

    it('each DaySchedule contains the correct date, dayName, and entries', async () => {
      const entry = makeEntry({ id: 'mon-e1', day: 'Monday' });
      const mockDay = mockResolveDayUseCase([entry]);
      const useCase = new ResolveWeekUseCase(mockDay as unknown as ResolveDayUseCase);

      const result: DaySchedule[] = await useCase.execute({ date: '2026-04-07', group: 'Gr. 1' });

      expect(result[0]).toEqual({
        date: '2026-04-06',
        dayName: 'Monday',
        entries: [entry],
      });
      expect(result[4]).toEqual({
        date: '2026-04-10',
        dayName: 'Friday',
        entries: [entry],
      });
    });

    it('includes lecture-free days as empty entries (delegated to ResolveDayUseCase)', async () => {
      // ResolveDayUseCase returns [] for lecture-free dates — week use case just passes through
      const mockDay = mockResolveDayUseCase([]);
      const useCase = new ResolveWeekUseCase(mockDay as unknown as ResolveDayUseCase);

      // Week containing May 1 (Friday, lecture-free)
      const result = await useCase.execute({ date: '2026-04-27', group: 'Gr. 1' });

      // All 5 days return empty (from mock), result still has 5 slots
      expect(result).toHaveLength(5);
      expect(result.every((d) => d.entries.length === 0)).toBe(true);
    });
  });
});
