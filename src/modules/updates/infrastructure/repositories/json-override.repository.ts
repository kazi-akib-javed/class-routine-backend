import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Override, RawOverride } from '../../domain/entities/override.entity';
import { IOverrideRepository } from '../../domain/repositories/override.repository.interface';
import {
  IScheduleRepository,
  SCHEDULE_REPOSITORY_TOKEN,
} from '../../../schedule/domain/repositories/schedule.repository.interface';

@Injectable()
export class JsonOverrideRepository implements IOverrideRepository, OnModuleInit {
  /** In-memory store keyed by entryId — one override per entry. */
  private readonly overrides = new Map<string, Override>();
  private readonly filePath: string;

  constructor(
    @Inject(SCHEDULE_REPOSITORY_TOKEN)
    private readonly scheduleRepository: IScheduleRepository,
  ) {
    this.filePath = path.join(process.cwd(), 'data', 'overrides.json');
  }

  /**
   * Runs after all dependencies are resolved.
   * Loads persisted overrides and re-applies them to in-memory schedule entries.
   */
  async onModuleInit(): Promise<void> {
    if (!fs.existsSync(this.filePath)) return;

    const raw: RawOverride[] = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
    for (const rawOverride of raw) {
      const override = Override.fromJSON(rawOverride);
      this.overrides.set(override.entryId, override);

      const entry = await this.scheduleRepository.findById(override.entryId);
      if (entry) {
        entry.applyOverride(override.toOverrideData());
      }
    }
  }

  findAll(): Override[] {
    return Array.from(this.overrides.values());
  }

  findByEntryId(entryId: string): Override | null {
    return this.overrides.get(entryId) ?? null;
  }

  save(override: Override): void {
    this.overrides.set(override.entryId, override);
    this.persist();
  }

  deleteByEntryId(entryId: string): void {
    this.overrides.delete(entryId);
    this.persist();
  }

  private persist(): void {
    const data = Array.from(this.overrides.values()).map((o) => o.toJSON());
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}
