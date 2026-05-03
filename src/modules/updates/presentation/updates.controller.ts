import { Controller, Get, Post, Delete, Param, Body, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { PostOverrideUseCase } from '../application/use-cases/post-override.usecase';
import { ClearOverrideUseCase } from '../application/use-cases/clear-override.usecase';
import { IOverrideRepository, OVERRIDE_REPOSITORY_TOKEN } from '../domain/repositories/override.repository.interface';
import { CreateOverrideDto } from '../application/dtos/create-override.dto';

@ApiTags('updates')
@Controller('updates')
export class UpdatesController {
  constructor(
    @Inject(OVERRIDE_REPOSITORY_TOKEN)
    private readonly overrideRepository: IOverrideRepository,
    private readonly postOverrideUseCase: PostOverrideUseCase,
    private readonly clearOverrideUseCase: ClearOverrideUseCase,
  ) {}

  @ApiOperation({ summary: 'List all active schedule overrides' })
  @Get()
  findAll() {
    return this.overrideRepository.findAll();
  }

  @ApiOperation({ summary: 'Post a new override for a schedule entry (upserts by entryId)' })
  @ApiBody({ type: CreateOverrideDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateOverrideDto) {
    return this.postOverrideUseCase.execute({
      entryId: dto.entryId,
      date: dto.date,
      override: dto.override,
    });
  }

  @ApiOperation({ summary: 'Delete the override for a schedule entry' })
  @ApiParam({ name: 'entryId', description: 'Schedule entry ID', example: 'odd-mon-b1-math-lec' })
  @Delete(':entryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('entryId') entryId: string) {
    return this.clearOverrideUseCase.execute(entryId);
  }
}
