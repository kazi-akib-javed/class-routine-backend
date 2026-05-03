import { Inject, Injectable } from '@nestjs/common';
import { Override, OverrideFields } from '../../domain/entities/override.entity';
import {
  IOverrideRepository,
  OVERRIDE_REPOSITORY_TOKEN,
} from '../../domain/repositories/override.repository.interface';
import {
  IScheduleRepository,
  SCHEDULE_REPOSITORY_TOKEN,
} from '../../../schedule/domain/repositories/schedule.repository.interface';
import { EntryNotFoundException } from '../../../schedule/domain/exceptions/entry-not-found.exception';

export interface PostOverrideInput {
  entryId: string;
  date: string;
  override: OverrideFields;
}

@Injectable()
export class PostOverrideUseCase {
  constructor(
    @Inject(SCHEDULE_REPOSITORY_TOKEN)
    private readonly scheduleRepository: IScheduleRepository,
    @Inject(OVERRIDE_REPOSITORY_TOKEN)
    private readonly overrideRepository: IOverrideRepository,
  ) {}

  async execute(input: PostOverrideInput): Promise<Override> {
    const entry = await this.scheduleRepository.findById(input.entryId);
    if (!entry) {
      throw new EntryNotFoundException(input.entryId);
    }

    const override = Override.create(input.entryId, input.date, input.override);
    this.overrideRepository.save(override);
    entry.applyOverride(override.toOverrideData());

    return override;
  }
}
