import { Controller, Get, Query } from '@nestjs/common';
import { ResolveDayUseCase } from '../application/use-cases/resolve-day.usecase';
import { ResolveWeekUseCase } from '../application/use-cases/resolve-week.usecase';
import { ResolveDayDto } from '../application/dtos/resolve-day.dto';
import { ResolveWeekDto } from '../application/dtos/resolve-week.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(
    private readonly resolveDayUseCase: ResolveDayUseCase,
    private readonly resolveWeekUseCase: ResolveWeekUseCase,
  ) {}

  @Get('day')
  getDay(@Query() dto: ResolveDayDto) {
    return this.resolveDayUseCase.execute({ date: dto.date, group: dto.group });
  }

  @Get('week')
  getWeek(@Query() dto: ResolveWeekDto) {
    return this.resolveWeekUseCase.execute({ date: dto.date, group: dto.group });
  }
}
