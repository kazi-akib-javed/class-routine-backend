import { Module } from '@nestjs/common';
import { ScheduleModule } from '../schedule/schedule.module';
import { JsonOverrideRepository } from './infrastructure/repositories/json-override.repository';
import { PostOverrideUseCase } from './application/use-cases/post-override.usecase';
import { ClearOverrideUseCase } from './application/use-cases/clear-override.usecase';
import { UpdatesController } from './presentation/updates.controller';
import { OVERRIDE_REPOSITORY_TOKEN } from './domain/repositories/override.repository.interface';

@Module({
  imports: [ScheduleModule],
  controllers: [UpdatesController],
  providers: [
    { provide: OVERRIDE_REPOSITORY_TOKEN, useClass: JsonOverrideRepository },
    PostOverrideUseCase,
    ClearOverrideUseCase,
  ],
  exports: [],
})
export class UpdatesModule {}
