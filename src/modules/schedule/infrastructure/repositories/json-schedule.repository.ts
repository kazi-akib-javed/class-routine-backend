import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { ScheduleEntry, RawScheduleEntry } from '../../domain/entities/schedule-entry.entity';
import { IScheduleRepository } from '../../domain/repositories/schedule.repository.interface';

interface ScheduleJson {
  schedule: {
    odd_weeks: RawScheduleEntry[];
    even_weeks: RawScheduleEntry[];
  };
}

@Injectable()
export class JsonScheduleRepository implements IScheduleRepository {
  /** All entries indexed by id for O(1) findById. */
  private readonly byId = new Map<string, ScheduleEntry>();

  /** Odd-week entries indexed by lowercase day name. */
  private readonly oddByDay = new Map<string, ScheduleEntry[]>();

  /** Even-week entries indexed by lowercase day name. */
  private readonly evenByDay = new Map<string, ScheduleEntry[]>();

  constructor() {
    const filePath = path.join(process.cwd(), 'data', 'schedule.json');
    const raw: ScheduleJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    this.load(raw.schedule.odd_weeks, this.oddByDay);
    this.load(raw.schedule.even_weeks, this.evenByDay);
  }

  private load(rawEntries: RawScheduleEntry[], dayMap: Map<string, ScheduleEntry[]>): void {
    for (const raw of rawEntries) {
      const entry = ScheduleEntry.fromJSON(raw);
      this.byId.set(entry.id, entry);
      const key = entry.day.toLowerCase();
      if (!dayMap.has(key)) dayMap.set(key, []);
      dayMap.get(key).push(entry);
    }
  }

  async findAll(): Promise<ScheduleEntry[]> {
    return Array.from(this.byId.values());
  }

  async findById(id: string): Promise<ScheduleEntry | null> {
    return this.byId.get(id) ?? null;
  }

  async findByWeekType(weekType: 'odd' | 'even'): Promise<ScheduleEntry[]> {
    const map = weekType === 'odd' ? this.oddByDay : this.evenByDay;
    const all: ScheduleEntry[] = [];
    for (const entries of map.values()) all.push(...entries);
    return all;
  }

  async findByWeekTypeAndDay(weekType: 'odd' | 'even', day: string): Promise<ScheduleEntry[]> {
    const map = weekType === 'odd' ? this.oddByDay : this.evenByDay;
    return map.get(day.toLowerCase()) ?? [];
  }
}
