import { Injectable } from '@nestjs/common';
import { WeekParity } from '../../modules/schedule/domain/value-objects/week-parity.vo';

export interface WeekResolution {
  isoWeek: number;
  weekParity: WeekParity;
  dayName: string;
  isLectureFree: boolean;
}

const LECTURE_FREE_DATES = new Set([
  '2026-05-01',
  '2026-05-14',
  '2026-05-15',
  '2026-05-25',
]);

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Injectable()
export class WeekResolverService {
  resolve(dateStr: string): WeekResolution {
    const date = new Date(dateStr + 'T00:00:00Z');
    const isoWeek = this.getIsoWeek(date);
    const weekParity = WeekParity.fromIsoWeek(isoWeek);
    const dayName = DAY_NAMES[date.getUTCDay()];
    const isLectureFree = LECTURE_FREE_DATES.has(dateStr);
    return { isoWeek, weekParity, dayName, isLectureFree };
  }

  private getIsoWeek(date: Date): number {
    // ISO 8601 week: week containing the first Thursday of the year is week 1
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayOfWeek = d.getUTCDay() || 7; // Mon=1 … Sun=7
    d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek); // nearest Thursday
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  }
}
