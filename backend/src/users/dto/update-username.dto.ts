import { IsString, Matches } from 'class-validator';

export class UpdateUsernameDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/)
  username!: string;
}
