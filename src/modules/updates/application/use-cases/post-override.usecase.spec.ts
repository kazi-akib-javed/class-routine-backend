import { PostOverrideUseCase } from './post-override.usecase';
import { IScheduleRepository } from '../../../schedule/domain/repositories/schedule.repository.interface';
import { IOverrideRepository } from '../../domain/repositories/override.repository.interface';
import { ScheduleEntry, RawScheduleEntry } from '../../../schedule/domain/entities/schedule-entry.entity';
import { EntryNotFoundException } from '../../../schedule/domain/exceptions/entry-not-found.exception';

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

function mockScheduleRepo(entry: ScheduleEntry | null = null): jest.Mocked<IScheduleRepository> {
  return {
    findById: jest.fn().mockResolvedValue(entry),
    findAll: jest.fn().mockResolvedValue([]),
    findByWeekType: jest.fn().mockResolvedValue([]),
    findByWeekTypeAndDay: jest.fn().mockResolvedValue([]),
  };
}

function mockOverrideRepo(): jest.Mocked<IOverrideRepository> {
  return {
    findAll: jest.fn().mockReturnValue([]),
    findByEntryId: jest.fn().mockReturnValue(null),
    save: jest.fn(),
    deleteByEntryId: jest.fn(),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PostOverrideUseCase', () => {
  describe('execute()', () => {
    it('saves the override when the entry exists', async () => {
      const entry = makeEntry({ id: 'entry-1' });
      const scheduleRepo = mockScheduleRepo(entry);
      const overrideRepo = mockOverrideRepo();

      const useCase = new PostOverrideUseCase(scheduleRepo, overrideRepo);
      await useCase.execute({ entryId: 'entry-1', date: '2026-04-07', override: { cancelled: true } });

      expect(overrideRepo.save).toHaveBeenCalledTimes(1);
    });

    it('returns the created Override with correct entryId and date', async () => {
      const entry = makeEntry({ id: 'entry-1' });
      const useCase = new PostOverrideUseCase(mockScheduleRepo(entry), mockOverrideRepo());

      const result = await useCase.execute({
        entryId: 'entry-1',
        date: '2026-04-07',
        override: { room: 'B202' },
      });

      expect(result.entryId).toBe('entry-1');
      expect(result.date).toBe('2026-04-07');
      expect(result.room).toBe('B202');
      expect(result.id).toBeDefined();
    });

    it('applies the override to the in-memory schedule entry', async () => {
      const entry = makeEntry({ id: 'entry-1' });
      const useCase = new PostOverrideUseCase(mockScheduleRepo(entry), mockOverrideRepo());

      await useCase.execute({
        entryId: 'entry-1',
        date: '2026-04-07',
        override: { room: 'C303', cancelled: false },
      });

      expect(entry.override).toBeDefined();
      expect(entry.override?.room).toBe('C303');
    });

    it('marks the entry as cancelled when cancelled=true is passed', async () => {
      const entry = makeEntry({ id: 'entry-1' });
      const useCase = new PostOverrideUseCase(mockScheduleRepo(entry), mockOverrideRepo());

      await useCase.execute({
        entryId: 'entry-1',
        date: '2026-05-01',
        override: { cancelled: true },
      });

      expect(entry.isCancelled()).toBe(true);
    });

    it('defaults cancelled to false when not provided', async () => {
      const entry = makeEntry({ id: 'entry-1' });
      const useCase = new PostOverrideUseCase(mockScheduleRepo(entry), mockOverrideRepo());

      const result = await useCase.execute({
        entryId: 'entry-1',
        date: '2026-04-07',
        override: { room: 'B202' },
      });

      expect(result.cancelled).toBe(false);
    });

    it('throws EntryNotFoundException when the entry does not exist', async () => {
      const useCase = new PostOverrideUseCase(mockScheduleRepo(null), mockOverrideRepo());

      await expect(
        useCase.execute({ entryId: 'nonexistent', date: '2026-04-07', override: {} }),
      ).rejects.toThrow(EntryNotFoundException);
    });

    it('looks up the entry by the provided entryId', async () => {
      const entry = makeEntry({ id: 'entry-42' });
      const scheduleRepo = mockScheduleRepo(entry);
      const useCase = new PostOverrideUseCase(scheduleRepo, mockOverrideRepo());

      await useCase.execute({ entryId: 'entry-42', date: '2026-04-07', override: {} });

      expect(scheduleRepo.findById).toHaveBeenCalledWith('entry-42');
    });
  });
});
