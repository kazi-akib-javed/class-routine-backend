import { Controller, Get, Param, ParseIntPipe, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { INatSciRepository, NATSCI_REPOSITORY_TOKEN } from '../domain/repositories/natsci.repository.interface';
import { NatSciWeekNotFoundException } from '../domain/exceptions/natsci-week-not-found.exception';
import { ResolveNatSciUseCase } from '../application/use-cases/resolve-natsci.usecase';
import { GetNatSciSessionsDto } from '../application/dtos/get-natsci-sessions.dto';

@ApiTags('natsci')
@Controller('natsci')
export class NatSciController {
  constructor(
    @Inject(NATSCI_REPOSITORY_TOKEN)
    private readonly natSciRepository: INatSciRepository,
    private readonly resolveNatSciUseCase: ResolveNatSciUseCase,
  ) {}

  @ApiOperation({ summary: 'Get the full NatSci week plan for a calendar week' })
  @ApiParam({ name: 'cw', description: 'ISO calendar week number', example: 15 })
  @Get(':cw')
  getWeek(@Param('cw', ParseIntPipe) cw: number) {
    const week = this.natSciRepository.findByCW(cw);
    if (!week) throw new NatSciWeekNotFoundException(cw);
    return week;
  }

  @ApiOperation({ summary: 'Get NatSci sessions for a specific day and optional group' })
  @ApiParam({ name: 'cw', description: 'ISO calendar week number', example: 15 })
  @ApiQuery({ name: 'day', description: 'Day name (Tuesday or Wednesday)', example: 'Wednesday' })
  @ApiQuery({ name: 'group', description: 'Student group for filtering (optional)', example: 'Gr. 1', required: false })
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
