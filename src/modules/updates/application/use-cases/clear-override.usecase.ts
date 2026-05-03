import { Inject, Injectable } from '@nestjs/common';
import {
  IOverrideRepository,
  OVERRIDE_REPOSITORY_TOKEN,
} from '../../domain/repositories/override.repository.interface';
import {
  IScheduleRepository,
  SCHEDULE_REPOSITORY_TOKEN,
} from '../../../schedule/domain/repositories/schedule.repository.interface';
import { EntryNotFoundException } from '../../../schedule/domain/exceptions/entry-not-found.exception';

@Injectable()
export class ClearOverrideUseCase {
  constructor(
    @Inject(SCHEDULE_REPOSITORY_TOKEN)
    private readonly scheduleRepository: IScheduleRepository,
    @Inject(OVERRIDE_REPOSITORY_TOKEN)
    private readonly overrideRepository: IOverrideRepository,
  ) {}

  async execute(entryId: string): Promise<void> {
    const entry = await this.scheduleRepository.findById(entryId);
    if (!entry) {
      throw new EntryNotFoundException(entryId);
    }

    this.overrideRepository.deleteByEntryId(entryId);
    entry.override = null;
  }
}
