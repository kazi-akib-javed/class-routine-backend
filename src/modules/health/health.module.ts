import { Module } from '@nestjs/common';
import { ScheduleModule } from '../schedule/schedule.module';
import { NatSciModule } from '../natsci/natsci.module';
import { UpdatesModule } from '../updates/updates.module';
import { HealthController } from './health.controller';

@Module({
  imports: [ScheduleModule, NatSciModule, UpdatesModule],
  controllers: [HealthController],
})
export class HealthModule {}
