import { Controller, Get, Param, ParseIntPipe, Query, Inject } from '@nestjs/common';
import { INatSciRepository, NATSCI_REPOSITORY_TOKEN } from '../domain/repositories/natsci.repository.interface';
import { NatSciWeekNotFoundException } from '../domain/exceptions/natsci-week-not-found.exception';
import { ResolveNatSciUseCase } from '../application/use-cases/resolve-natsci.usecase';
import { GetNatSciSessionsDto } from '../application/dtos/get-natsci-sessions.dto';

@Controller('natsci')
export class NatSciController {
  constructor(
    @Inject(NATSCI_REPOSITORY_TOKEN)
    private readonly natSciRepository: INatSciRepository,
    private readonly resolveNatSciUseCase: ResolveNatSciUseCase,
  ) {}

  /** GET /api/natsci/:cw — returns the full week plan */
  @Get(':cw')
  getWeek(@Param('cw', ParseIntPipe) cw: number) {
    const week = this.natSciRepository.findByCW(cw);
    if (!week) throw new NatSciWeekNotFoundException(cw);
    return week;
  }

  /** GET /api/natsci/:cw/sessions?day=Wednesday&group=Gr.+1 */
  @Get(':cw/sessions')
  getSessions(
    @Param('cw', ParseIntPipe) cw: number,
    @Query() dto: GetNatSciSessionsDto,
  ) {
    return this.resolveNatSciUseCase.execute({
      cw,
      day: dto.day,
      group: dto.group,
    });
  }
}
