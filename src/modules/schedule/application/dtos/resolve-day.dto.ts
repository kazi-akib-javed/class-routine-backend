import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class ResolveDayDto {
  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  group: string;
}
