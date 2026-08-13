import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) =>
    (value as string).trim().toLowerCase(),
  )
  identity!: string;

  @IsString()
  @Transform(({ value }: TransformFnParams) => (value as string).trim())
  password!: string;
}
