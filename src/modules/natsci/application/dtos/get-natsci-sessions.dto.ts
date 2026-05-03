import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GetNatSciSessionsDto {
  @IsString()
  @IsNotEmpty()
  day: string;

  @IsOptional()
  @IsString()
  group?: string;
}
