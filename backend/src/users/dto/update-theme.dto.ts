import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class UpdateBoardThemeDto {
  @Type(() => Number)
  @IsInt()
  boardTheme!: number;
}

export class UpdateBackgroundThemeDto {
  @Type(() => Number)
  @IsInt()
  backgroundTheme!: number;
}
