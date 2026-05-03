import { NatSciWeek } from '../entities/natsci-week.entity';

/**
 * Synchronous repository — data is loaded at startup and held in memory.
 */
export interface INatSciRepository {
  findAll(): NatSciWeek[];
  findByCW(cw: number): NatSciWeek | null;
}

export const NATSCI_REPOSITORY_TOKEN = 'INatSciRepository';
