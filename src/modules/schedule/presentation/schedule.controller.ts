import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ResolveDayUseCase } from '../application/use-cases/resolve-day.usecase';
import { ResolveWeekUseCase } from '../application/use-cases/resolve-week.usecase';
import { ResolveDayDto } from '../application/dtos/resolve-day.dto';
import { ResolveWeekDto } from '../application/dtos/resolve-week.dto';

@ApiTags('schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(
    private readonly resolveDayUseCase: ResolveDayUseCase,
    private readonly resolveWeekUseCase: ResolveWeekUseCase,
  ) {}

  @ApiOperation({ summary: 'Get schedule entries for a specific date filtered by group' })
  @ApiQuery({ name: 'date', description: 'ISO date string', example: '2026-04-07' })
  @ApiQuery({ name: 'group', description: 'Student group (e.g. "Gr. 1", "Gr. 1A")', example: 'Gr. 1' })
  @Get('day')
  getDay(@Query() dto: ResolveDayDto) {
    return this.resolveDayUseCase.execute({ date: dto.date, group: dto.group });
  }

  @ApiOperation({ summary: 'Get full week schedule for the week containing the given date' })
  @ApiQuery({ name: 'date', description: 'Any ISO date within the target week', example: '2026-04-07' })
  @ApiQuery({ name: 'group', description: 'Student group', example: 'Gr. 1' })
  @Get('week')
  getWeek(@Query() dto: ResolveWeekDto) {
    return this.resolveWeekUseCase.execute({ date: dto.date, group: dto.group });
  }
}
