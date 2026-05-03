import { Module } from '@nestjs/common';
import { WeekResolverService } from './services/week-resolver.service';

@Module({
  imports: [],
  providers: [WeekResolverService],
  exports: [WeekResolverService],
})
export class SharedModule {}
