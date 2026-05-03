import { ScheduleEntry } from '../entities/schedule-entry.entity';

export interface IScheduleRepository {
  findAll(): Promise<ScheduleEntry[]>;
  findById(id: string): Promise<ScheduleEntry | null>;
  findByWeekType(weekType: 'odd' | 'even'): Promise<ScheduleEntry[]>;
  findByWeekTypeAndDay(weekType: 'odd' | 'even', day: string): Promise<ScheduleEntry[]>;
}

export const SCHEDULE_REPOSITORY_TOKEN = 'IScheduleRepository';
