import { Module } from '@nestjs/common';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { UpdatesModule } from './modules/updates/updates.module';
import { NatSciModule } from './modules/natsci/natsci.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [SharedModule, ScheduleModule, UpdatesModule, NatSciModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
