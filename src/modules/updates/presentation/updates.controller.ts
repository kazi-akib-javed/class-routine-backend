import { Controller, Get, Post, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PostOverrideUseCase } from '../application/use-cases/post-override.usecase';
import { ClearOverrideUseCase } from '../application/use-cases/clear-override.usecase';
import { IOverrideRepository } from '../domain/repositories/override.repository.interface';
import { CreateOverrideDto } from '../application/dtos/create-override.dto';
import { Inject } from '@nestjs/common';
import { OVERRIDE_REPOSITORY_TOKEN } from '../domain/repositories/override.repository.interface';

@Controller('updates')
export class UpdatesController {
  constructor(
    @Inject(OVERRIDE_REPOSITORY_TOKEN)
    private readonly overrideRepository: IOverrideRepository,
    private readonly postOverrideUseCase: PostOverrideUseCase,
    private readonly clearOverrideUseCase: ClearOverrideUseCase,
  ) {}

  @Get()
  findAll() {
    return this.overrideRepository.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateOverrideDto) {
    return this.postOverrideUseCase.execute({
      entryId: dto.entryId,
      date: dto.date,
      override: dto.override,
    });
  }

  @Delete(':entryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('entryId') entryId: string) {
    return this.clearOverrideUseCase.execute(entryId);
  }
}
