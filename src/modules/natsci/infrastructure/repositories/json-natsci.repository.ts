import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { NatSciWeek, RawNatSciWeek } from '../../domain/entities/natsci-week.entity';
import { INatSciRepository } from '../../domain/repositories/natsci.repository.interface';

interface ScheduleJson {
  nat_sci_schedule: {
    weekly_plan: RawNatSciWeek[];
  };
}

@Injectable()
export class JsonNatSciRepository implements INatSciRepository {
  /** Weeks indexed by CW number for O(1) lookup. */
  private readonly byCW = new Map<number, NatSciWeek>();

  constructor() {
    const filePath = path.join(process.cwd(), 'data', 'schedule.json');
    const raw: ScheduleJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    for (const entry of raw.nat_sci_schedule.weekly_plan) {
      const week = NatSciWeek.fromJSON(entry);
      this.byCW.set(week.cw, week);
    }
  }

  findAll(): NatSciWeek[] {
    return Array.from(this.byCW.values());
  }

  findByCW(cw: number): NatSciWeek | null {
    return this.byCW.get(cw) ?? null;
  }
}
