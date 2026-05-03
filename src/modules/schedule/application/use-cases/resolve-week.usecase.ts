import { Injectable } from '@nestjs/common';
import { ScheduleEntry } from '../../domain/entities/schedule-entry.entity';
import { ResolveDayUseCase } from './resolve-day.usecase';

export interface DaySchedule {
  date: string;
  dayName: string;
  entries: ScheduleEntry[];
}

export interface ResolveWeekInput {
  date: string;
  group: string;
}

const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

@Injectable()
export class ResolveWeekUseCase {
  constructor(private readonly resolveDayUseCase: ResolveDayUseCase) {}

  async execute(input: ResolveWeekInput): Promise<DaySchedule[]> {
    const weekDates = this.getMonToFriDates(input.date);

    return Promise.all(
      weekDates.map(async ({ date, dayName }) => {
        const entries = await this.resolveDayUseCase.execute({ date, group: input.group });
        return { date, dayName, entries };
      }),
    );
  }

  /**
   * Given any date string, returns the ISO date strings for Monday–Friday
   * of the same ISO calendar week.
   */
  private getMonToFriDates(dateStr: string): { date: string; dayName: string }[] {
    const d = new Date(dateStr + 'T00:00:00Z');
    // getUTCDay(): 0=Sun, 1=Mon … 6=Sat; treat Sun as 7 for ISO week arithmetic
    const dayOfWeek = d.getUTCDay() || 7;
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - dayOfWeek + 1);

    return WEEKDAY_NAMES.map((dayName, i) => {
      const day = new Date(monday);
      day.setUTCDate(monday.getUTCDate() + i);
      return { date: day.toISOString().split('T')[0], dayName };
    });
  }
}
