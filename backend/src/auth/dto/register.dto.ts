import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  // @IsString()
  // @MinLength(1)
  // name!: string;

  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEmail()
  email!: string;

  avatarUrl!: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  password!: string;
}
