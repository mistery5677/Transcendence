import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailer: MailerService) {}

  async sendResetPasswordEmail(email: string, token: string) {
    const url = `http://localhost:5173/reset-password?token=${token}`;

    this.logger.log(`Sending password reset email to ${email}`);

    try {
      const result = await this.mailer.sendMail({
        from: '"Chess" <no-reply@chess.com>',
        to: email,
        subject: 'Reset your password',
        html: `
          <h2>Reset your password</h2>

          <p>Click the button below to reset your password.</p>

          <a href="${url}">Reset Password</a>

          <p>This link expires in 15 minutes.</p>
        `,
      });

      this.logger.log(`Password reset email sent to ${email}`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error);
      throw error;
    }
  }
}