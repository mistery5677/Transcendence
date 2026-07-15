import { IsEmail, Matches } from 'class-validator';
import { IsValidPassword } from 'src/common/validation/password.validator';

export class RegisterDto {
  // @IsString()
  // @MinLength(1)
  // name!: string;

  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Username must contain only letters and numbers',
  })
  username!: string;

  @IsEmail()
  email!: string;

  avatarUrl!: string;

  @IsValidPassword()
  password!: string;
}
