import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  IScheduleRepository,
  SCHEDULE_REPOSITORY_TOKEN,
} from '../schedule/domain/repositories/schedule.repository.interface';
import {
  INatSciRepository,
  NATSCI_REPOSITORY_TOKEN,
} from '../natsci/domain/repositories/natsci.repository.interface';
import {
  IOverrideRepository,
  OVERRIDE_REPOSITORY_TOKEN,
} from '../updates/domain/repositories/override.repository.interface';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(SCHEDULE_REPOSITORY_TOKEN)
    private readonly scheduleRepository: IScheduleRepository,
    @Inject(NATSCI_REPOSITORY_TOKEN)
    private readonly natSciRepository: INatSciRepository,
    @Inject(OVERRIDE_REPOSITORY_TOKEN)
    private readonly overrideRepository: IOverrideRepository,
  ) {}

  @ApiOperation({ summary: 'System health check with live counts from all repositories' })
  @Get()
  async getHealth() {
    const scheduleEntries = await this.scheduleRepository.findAll();
    return {
      status: 'ok',
      uptime: `${process.uptime().toFixed(1)}s`,
      schedule_entries: scheduleEntries.length,
      natsci_weeks: this.natSciRepository.findAll().length,
      active_overrides: this.overrideRepository.findAll().length,
    };
  }
}
