import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AnalyzeDto {
  @IsString()
  @IsNotEmpty()
  fen!: string;

  @IsOptional()
  @IsInt()
  level?: number;

  @IsOptional()
  @IsInt()
  moveTimeMs?: number;
}
