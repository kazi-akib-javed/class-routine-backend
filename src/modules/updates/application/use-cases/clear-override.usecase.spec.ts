import { ClearOverrideUseCase } from './clear-override.usecase';
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

describe('ClearOverrideUseCase', () => {
  describe('execute()', () => {
    it('calls deleteByEntryId on the override repository', async () => {
      const entry = makeEntry({ id: 'entry-1', override: { cancelled: true } });
      const overrideRepo = mockOverrideRepo();
      const useCase = new ClearOverrideUseCase(mockScheduleRepo(entry), overrideRepo);

      await useCase.execute('entry-1');

      expect(overrideRepo.deleteByEntryId).toHaveBeenCalledWith('entry-1');
    });

    it('resets the in-memory entry override to null', async () => {
      const entry = makeEntry({ id: 'entry-1', override: { room: 'B202', cancelled: false } });
      const useCase = new ClearOverrideUseCase(mockScheduleRepo(entry), mockOverrideRepo());

      await useCase.execute('entry-1');

      expect(entry.override).toBeNull();
    });

    it('throws EntryNotFoundException when the entry does not exist', async () => {
      const useCase = new ClearOverrideUseCase(mockScheduleRepo(null), mockOverrideRepo());

      await expect(useCase.execute('nonexistent')).rejects.toThrow(EntryNotFoundException);
    });

    it('still deletes the override record even if entry has no active override', async () => {
      // Entry exists but its override is already null — still call delete for idempotency
      const entry = makeEntry({ id: 'entry-1', override: null });
      const overrideRepo = mockOverrideRepo();
      const useCase = new ClearOverrideUseCase(mockScheduleRepo(entry), overrideRepo);

      await useCase.execute('entry-1');

      expect(overrideRepo.deleteByEntryId).toHaveBeenCalledWith('entry-1');
      expect(entry.override).toBeNull();
    });

    it('looks up the entry by the provided entryId', async () => {
      const entry = makeEntry({ id: 'entry-99' });
      const scheduleRepo = mockScheduleRepo(entry);
      const useCase = new ClearOverrideUseCase(scheduleRepo, mockOverrideRepo());

      await useCase.execute('entry-99');

      expect(scheduleRepo.findById).toHaveBeenCalledWith('entry-99');
    });
  });
});
