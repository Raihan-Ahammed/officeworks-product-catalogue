import nodemailer, { type Transporter } from 'nodemailer';
import type { EmailProvider, EnquiryEmail } from './EmailProvider.js';

export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
}

/**
 * Delivers enquiry email over SMTP. Point it at any SMTP server:
 * a local catch-all inbox in development (the repo runs Maildev for you) or
 * a real provider (SES, SendGrid, ...) in production via environment config.
 */
export class SmtpEmailProvider implements EmailProvider {
  private readonly transporter: Transporter;

  constructor(private readonly settings: SmtpSettings) {
    this.transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      ...(settings.user ? { auth: { user: settings.user, pass: settings.pass } } : {}),
    });
  }

  async send(mail: EnquiryEmail): Promise<void> {
    await this.transporter.sendMail({
      from: this.settings.from,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
    });
  }
}
