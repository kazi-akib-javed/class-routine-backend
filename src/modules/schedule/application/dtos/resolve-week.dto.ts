import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class ResolveWeekDto {
  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  group: string;
}
