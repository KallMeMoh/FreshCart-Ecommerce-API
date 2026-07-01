import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import nodemailer, { type Transporter } from 'nodemailer';
import { passwordResetTemplate } from './templates/password-reset';
import { accountVerificationTemplate } from './templates/account-verification';
import { twoFactorAuthTemplate } from './templates/2fa-otp';

@Injectable()
export class MailService {
  transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.smtpUser,
        pass: this.configService.smtpPass,
      },
    });
  }

  private async sendEmail(to: string, subject: string, template: string) {
    await this.transporter.sendMail({
      from: 'onboarding@resend.dev',
      to,
      subject,
      html: template,
    });
  }

  async sendVerificationEmail(to: string, link: string) {
    await this.sendEmail(
      to,
      'Verify your E-Commerce app account',
      accountVerificationTemplate(link),
    );
  }

  async sendPasswordResetEmail(to: string, link: string) {
    await this.sendEmail(
      to,
      'Reset your E-Commerce app password',
      passwordResetTemplate(link),
    );
  }

  async send2FAEmail(to: string, code: string) {
    await this.sendEmail(
      to,
      'Your Requested 2FA Code',
      twoFactorAuthTemplate(code),
    );
  }
}
