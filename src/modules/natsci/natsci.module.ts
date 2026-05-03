import { Module } from '@nestjs/common';
import { JsonNatSciRepository } from './infrastructure/repositories/json-natsci.repository';
import { ResolveNatSciUseCase } from './application/use-cases/resolve-natsci.usecase';
import { NatSciController } from './presentation/natsci.controller';
import { NATSCI_REPOSITORY_TOKEN } from './domain/repositories/natsci.repository.interface';

@Module({
  imports: [],
  controllers: [NatSciController],
  providers: [
    { provide: NATSCI_REPOSITORY_TOKEN, useClass: JsonNatSciRepository },
    ResolveNatSciUseCase,
  ],
  exports: [],
})
export class NatSciModule {}
