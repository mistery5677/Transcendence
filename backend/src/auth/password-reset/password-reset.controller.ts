import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AuthService } from '../auth.service';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('password-reset')
export class PasswordResetController {
  constructor(private readonly authService: AuthService) {}

  @Post('forgot')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ) {

    return this.authService.forgotPassword(
      forgotPasswordDto.email,
    );
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {

    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }
}