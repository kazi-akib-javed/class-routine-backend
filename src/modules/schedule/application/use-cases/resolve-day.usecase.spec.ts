import { ResolveDayUseCase } from './resolve-day.usecase';
import { IScheduleRepository } from '../../domain/repositories/schedule.repository.interface';
import { ScheduleEntry, RawScheduleEntry } from '../../domain/entities/schedule-entry.entity';
import { WeekResolverService, WeekResolution } from '../../../../shared/services/week-resolver.service';
import { WeekParity } from '../../domain/value-objects/week-parity.vo';

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

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

function mockRepository(
  entries: ScheduleEntry[] = [],
): jest.Mocked<IScheduleRepository> {
  return {
    findAll: jest.fn().mockResolvedValue(entries),
    findById: jest.fn().mockResolvedValue(null),
    findByWeekType: jest.fn().mockResolvedValue(entries),
    findByWeekTypeAndDay: jest.fn().mockResolvedValue(entries),
  };
}

function mockWeekResolver(resolution: Partial<WeekResolution> = {}): jest.Mocked<WeekResolverService> {
  const defaultResolution: WeekResolution = {
    isoWeek: 15,
    weekParity: WeekParity.fromIsoWeek(15), // 'odd'
    dayName: 'Tuesday',
    isLectureFree: false,
    ...resolution,
  };
  return {
    resolve: jest.fn().mockReturnValue(defaultResolution),
  } as unknown as jest.Mocked<WeekResolverService>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ResolveDayUseCase', () => {
  describe('execute()', () => {
    it('returns entries that match the requested group', async () => {
      const entry1 = makeEntry({ id: 'e1', target_groups: ['all'] });
      const entry2 = makeEntry({ id: 'e2', target_groups: ['Gr. 2'] });
      const repo = mockRepository([entry1, entry2]);
      const resolver = mockWeekResolver({ dayName: 'Monday' });

      const useCase = new ResolveDayUseCase(repo, resolver);
      const result = await useCase.execute({ date: '2026-04-07', group: 'Gr. 1' });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('e1');
      expect(repo.findByWeekTypeAndDay).toHaveBeenCalledWith('odd', 'Monday');
    });

    it('returns an empty array for lecture-free dates without querying the repository', async () => {
      const repo = mockRepository([makeEntry()]);
      const resolver = mockWeekResolver({ isLectureFree: true });

      const useCase = new ResolveDayUseCase(repo, resolver);
      const result = await useCase.execute({ date: '2026-05-01', group: 'Gr. 1' });

      expect(result).toHaveLength(0);
      expect(repo.findByWeekTypeAndDay).not.toHaveBeenCalled();
    });

    it('returns an empty array when no entries exist for that day', async () => {
      const repo = mockRepository([]);
      const resolver = mockWeekResolver({ dayName: 'Friday' });

      const useCase = new ResolveDayUseCase(repo, resolver);
      const result = await useCase.execute({ date: '2026-04-10', group: 'Gr. 1' });

      expect(result).toHaveLength(0);
    });

    it('includes entries targeted at a sub-group when the parent group is requested', async () => {
      // Entry targets "Gr. 1A"; user requests "Gr. 1" → prefix match, should include
      const entry = makeEntry({ id: 'e-sub', target_groups: ['Gr. 1A'] });
      const repo = mockRepository([entry]);
      const resolver = mockWeekResolver({ dayName: 'Monday' });

      const useCase = new ResolveDayUseCase(repo, resolver);
      const result = await useCase.execute({ date: '2026-04-07', group: 'Gr. 1' });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('e-sub');
    });

    it('includes entries targeted at a parent group when a sub-group is requested', async () => {
      // Entry targets "Gr. 1"; user requests "Gr. 1A" → should also include
      const entry = makeEntry({ id: 'e-parent', target_groups: ['Gr. 1'] });
      const repo = mockRepository([entry]);
      const resolver = mockWeekResolver({ dayName: 'Monday' });

      const useCase = new ResolveDayUseCase(repo, resolver);
      const result = await useCase.execute({ date: '2026-04-07', group: 'Gr. 1A' });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('e-parent');
    });

    it('excludes cancelled entries from the result', async () => {
      const entry = makeEntry({ id: 'cancelled', override: { cancelled: true } });
      const repo = mockRepository([entry]);
      const resolver = mockWeekResolver({ dayName: 'Monday' });

      const useCase = new ResolveDayUseCase(repo, resolver);
      const result = await useCase.execute({ date: '2026-04-07', group: 'all' });

      expect(result).toHaveLength(0);
    });

    it('calls WeekResolverService with the provided date string', async () => {
      const repo = mockRepository([]);
      const resolver = mockWeekResolver();

      const useCase = new ResolveDayUseCase(repo, resolver);
      await useCase.execute({ date: '2026-04-14', group: 'Gr. 1' });

      expect(resolver.resolve).toHaveBeenCalledWith('2026-04-14');
    });

    it('uses even parity when the ISO week is even', async () => {
      const evenEntry = makeEntry({ id: 'even-e', week_type: 'even', target_groups: ['all'] });
      const repo = mockRepository([evenEntry]);
      const resolver = mockWeekResolver({
        isoWeek: 16,
        weekParity: WeekParity.fromIsoWeek(16), // 'even'
        dayName: 'Monday',
      });

      const useCase = new ResolveDayUseCase(repo, resolver);
      const result = await useCase.execute({ date: '2026-04-14', group: 'Gr. 1' });

      expect(repo.findByWeekTypeAndDay).toHaveBeenCalledWith('even', 'Monday');
      expect(result).toHaveLength(1);
    });
  });
});
