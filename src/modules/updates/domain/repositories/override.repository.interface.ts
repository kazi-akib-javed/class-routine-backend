import { Override } from '../entities/override.entity';

/**
 * Synchronous repository — all data lives in memory,
 * reads and writes do not require IO round-trips from the caller's perspective.
 */
export interface IOverrideRepository {
  findAll(): Override[];
  findByEntryId(entryId: string): Override | null;
  save(override: Override): void;
  deleteByEntryId(entryId: string): void;
}

export const OVERRIDE_REPOSITORY_TOKEN = 'IOverrideRepository';
