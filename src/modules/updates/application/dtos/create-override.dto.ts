import {
  IsString,
  IsNotEmpty,
  IsDateString,
  ValidateNested,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OverrideFieldsDto {
  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  instruction?: string;

  @IsOptional()
  @IsBoolean()
  cancelled?: boolean;

  @IsOptional()
  @IsString()
  postponed_to?: string;
}

export class CreateOverrideDto {
  @IsString()
  @IsNotEmpty()
  entryId: string;

  @IsDateString()
  date: string;

  @ValidateNested()
  @Type(() => OverrideFieldsDto)
  override: OverrideFieldsDto;
}
