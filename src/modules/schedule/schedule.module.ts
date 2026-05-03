import { Module } from '@nestjs/common';
import { JsonScheduleRepository } from './infrastructure/repositories/json-schedule.repository';
import { ResolveDayUseCase } from './application/use-cases/resolve-day.usecase';
import { ResolveWeekUseCase } from './application/use-cases/resolve-week.usecase';
import { WeekResolverService } from '../../shared/services/week-resolver.service';
import { ScheduleController } from './presentation/schedule.controller';
import { SCHEDULE_REPOSITORY_TOKEN } from './domain/repositories/schedule.repository.interface';

@Module({
  imports: [],
  controllers: [ScheduleController],
  providers: [
    { provide: SCHEDULE_REPOSITORY_TOKEN, useClass: JsonScheduleRepository },
    WeekResolverService,
    ResolveDayUseCase,
    ResolveWeekUseCase,
  ],
  exports: [ResolveDayUseCase, ResolveWeekUseCase, SCHEDULE_REPOSITORY_TOKEN],
})
export class ScheduleModule {}
