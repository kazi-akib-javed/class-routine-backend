import { Module } from '@nestjs/common';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { UpdatesModule } from './modules/updates/updates.module';
import { NatSciModule } from './modules/natsci/natsci.module';
import { SharedModule } from './shared/shared.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [SharedModule, ScheduleModule, UpdatesModule, NatSciModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
