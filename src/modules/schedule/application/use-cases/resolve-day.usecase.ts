import { Inject, Injectable } from '@nestjs/common';
import { ScheduleEntry } from '../../domain/entities/schedule-entry.entity';
import {
  IScheduleRepository,
  SCHEDULE_REPOSITORY_TOKEN,
} from '../../domain/repositories/schedule.repository.interface';
import { WeekResolverService } from '../../../../shared/services/week-resolver.service';

export interface ResolveDayInput {
  date: string;
  group: string;
}

@Injectable()
export class ResolveDayUseCase {
  constructor(
    @Inject(SCHEDULE_REPOSITORY_TOKEN)
    private readonly scheduleRepository: IScheduleRepository,
    private readonly weekResolver: WeekResolverService,
  ) {}

  async execute(input: ResolveDayInput): Promise<ScheduleEntry[]> {
    const { isoWeek: _isoWeek, weekParity, dayName, isLectureFree } = this.weekResolver.resolve(
      input.date,
    );

    if (isLectureFree) {
      return [];
    }

    const entries = await this.scheduleRepository.findByWeekTypeAndDay(
      weekParity.value,
      dayName,
    );

    return entries.filter(
      (entry) => !entry.isCancelled() && entry.matchesGroup(input.group),
    );
  }
}
