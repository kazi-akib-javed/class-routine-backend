import { Inject, Injectable } from '@nestjs/common';
import { NatSciSession } from '../../domain/entities/natsci-week.entity';
import {
  INatSciRepository,
  NATSCI_REPOSITORY_TOKEN,
} from '../../domain/repositories/natsci.repository.interface';
import { NatSciWeekNotFoundException } from '../../domain/exceptions/natsci-week-not-found.exception';

export interface ResolveNatSciInput {
  cw: number;
  day: string;
  group?: string;
}

@Injectable()
export class ResolveNatSciUseCase {
  constructor(
    @Inject(NATSCI_REPOSITORY_TOKEN)
    private readonly natSciRepository: INatSciRepository,
  ) {}

  async execute(input: ResolveNatSciInput): Promise<NatSciSession[]> {
    const week = this.natSciRepository.findByCW(input.cw);
    if (!week) {
      throw new NatSciWeekNotFoundException(input.cw);
    }
    return week.getSessionsForDay(input.day, input.group);
  }
}
