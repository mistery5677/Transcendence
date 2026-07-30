import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { getJwtSecret } from './constant/jwt.constant';
import { MailModule } from 'src/mail/mail.module';
import { PasswordResetService } from './password-reset/password-reset.service';
import { PasswordResetController } from './password-reset/password-reset.controller';

@Module({
  imports: [
    UsersModule,
    MailModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: getJwtSecret(),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [
    AuthController,
    PasswordResetController,
  ],
  providers: [
    AuthService,
    PasswordResetService,
  ],
})
export class AuthModule {}