import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidPassword } from 'src/common/validation/password.validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @IsValidPassword()
  newPassword!: string;
}
