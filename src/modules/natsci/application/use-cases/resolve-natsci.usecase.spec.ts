import { ResolveNatSciUseCase } from './resolve-natsci.usecase';
import { INatSciRepository } from '../../domain/repositories/natsci.repository.interface';
import {
  NatSciWeek,
  RawNatSciWeek,
  RawNatSciSession,
  NatSciSession,
} from '../../domain/entities/natsci-week.entity';
import { NatSciWeekNotFoundException } from '../../domain/exceptions/natsci-week-not-found.exception';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRawSession(overrides: Partial<RawNatSciSession> = {}): RawNatSciSession {
  return {
    subject: 'Physics',
    session_type: 'lecture',
    time_slot: 'Block 2',
    groups: ['all'],
    note: '',
    ...overrides,
  };
}

function makeRawWeek(overrides: Partial<RawNatSciWeek> = {}): RawNatSciWeek {
  return {
    cw: 15,
    parity: 'odd',
    tuesday_date: '2026-04-07',
    wednesday_date: '2026-04-08',
    lecture_free: false,
    note: '',
    tuesday: makeRawSession({ subject: 'Chemistry', groups: ['all'] }),
    wednesday: makeRawSession({ subject: 'Physics', groups: ['all'] }),
    ...overrides,
  };
}

function makeWeek(overrides: Partial<RawNatSciWeek> = {}): NatSciWeek {
  return NatSciWeek.fromJSON(makeRawWeek(overrides));
}

function mockRepo(week: NatSciWeek | null = null): jest.Mocked<INatSciRepository> {
  return {
    findByCW: jest.fn().mockReturnValue(week),
    findAll: jest.fn().mockReturnValue(week ? [week] : []),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ResolveNatSciUseCase', () => {
  describe('execute()', () => {
    it('returns sessions for the given CW and day', async () => {
      const week = makeWeek({ cw: 15 });
      const useCase = new ResolveNatSciUseCase(mockRepo(week));

      const result = await useCase.execute({ cw: 15, day: 'Wednesday' });

      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe('Physics');
    });

    it('returns Tuesday sessions when day is "Tuesday"', async () => {
      const week = makeWeek({
        tuesday: makeRawSession({ subject: 'Chemistry', groups: ['all'] }),
      });
      const useCase = new ResolveNatSciUseCase(mockRepo(week));

      const result = await useCase.execute({ cw: 15, day: 'Tuesday' });

      expect(result[0].subject).toBe('Chemistry');
    });

    it('returns empty array for a non-NatSci day (e.g. Monday)', async () => {
      const week = makeWeek({ cw: 15 });
      const useCase = new ResolveNatSciUseCase(mockRepo(week));

      const result = await useCase.execute({ cw: 15, day: 'Monday' });

      expect(result).toEqual([]);
    });

    it('throws NatSciWeekNotFoundException when CW is not found', async () => {
      const useCase = new ResolveNatSciUseCase(mockRepo(null));

      await expect(useCase.execute({ cw: 99, day: 'Wednesday' })).rejects.toThrow(
        NatSciWeekNotFoundException,
      );
    });

    it('calls findByCW with the provided CW number', async () => {
      const week = makeWeek({ cw: 16 });
      const repo = mockRepo(week);
      const useCase = new ResolveNatSciUseCase(repo);

      await useCase.execute({ cw: 16, day: 'Wednesday' });

      expect(repo.findByCW).toHaveBeenCalledWith(16);
    });

    it('filters sessions by group when group is provided', async () => {
      const week = makeWeek({
        wednesday: [
          makeRawSession({ subject: 'Physics', groups: ['Gr. 1'] }),
          makeRawSession({ subject: 'Physics', groups: ['Gr. 2'] }),
        ],
      });
      const useCase = new ResolveNatSciUseCase(mockRepo(week));

      const result = await useCase.execute({ cw: 15, day: 'Wednesday', group: 'Gr. 1' });

      expect(result).toHaveLength(1);
      expect(result[0].groups).toContain('Gr. 1');
    });

    it('returns all sessions when no group is provided', async () => {
      const week = makeWeek({
        wednesday: [
          makeRawSession({ groups: ['Gr. 1'] }),
          makeRawSession({ groups: ['Gr. 2'] }),
        ],
      });
      const useCase = new ResolveNatSciUseCase(mockRepo(week));

      const result = await useCase.execute({ cw: 15, day: 'Wednesday' });

      expect(result).toHaveLength(2);
    });

    it('applies half-group matching: "Gr. 1" matches sessions for "Gr. 1A"', async () => {
      const week = makeWeek({
        tuesday: [
          makeRawSession({ subject: 'Chemistry', groups: ['Gr. 1A'] }),
          makeRawSession({ subject: 'Biology', groups: ['Gr. 1B'] }),
          makeRawSession({ subject: 'Chemistry', groups: ['Gr. 2A'] }),
        ],
      });
      const useCase = new ResolveNatSciUseCase(mockRepo(week));

      const result = await useCase.execute({ cw: 15, day: 'Tuesday', group: 'Gr. 1' });

      // Should match Gr. 1A and Gr. 1B (both are sub-groups of Gr. 1)
      expect(result).toHaveLength(2);
    });

    it('applies reverse half-group matching: "Gr. 1A" matches sessions targeted at "Gr. 1"', async () => {
      const week = makeWeek({
        wednesday: makeRawSession({ groups: ['Gr. 1'] }),
      });
      const useCase = new ResolveNatSciUseCase(mockRepo(week));

      const result = await useCase.execute({ cw: 15, day: 'Wednesday', group: 'Gr. 1A' });

      expect(result).toHaveLength(1);
    });

    it('is case-insensitive for day names', async () => {
      const week = makeWeek({ cw: 15 });
      const useCase = new ResolveNatSciUseCase(mockRepo(week));

      const result = await useCase.execute({ cw: 15, day: 'wednesday' });

      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe('Physics');
    });
  });
});
