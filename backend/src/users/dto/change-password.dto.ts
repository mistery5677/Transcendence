import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidPassword } from 'src/common/validation/password.validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @IsValidPassword()
  newPassword!: string;
}
