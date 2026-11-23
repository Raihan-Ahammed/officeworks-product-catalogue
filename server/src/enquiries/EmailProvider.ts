export interface EnquiryEmail {
  to: string;
  subject: string;
  text: string;
}

/**
 * Boundary between the app and its email delivery mechanism.
 * The entrepreneur expects the email provider to change, so the rest of the
 * app only knows this interface.
 */
export interface EmailProvider {
  send(mail: EnquiryEmail): Promise<void>;
}

/**
 * Default provider for local development: logs the email instead of sending
 * it, so the reviewer needs no SMTP account or credentials.
 * Swap in an SMTP/SES provider via configuration when going live.
 */
export class ConsoleEmailProvider implements EmailProvider {
  constructor(private readonly log: (...args: unknown[]) => void = console.log) {}

  async send(mail: EnquiryEmail): Promise<void> {
    this.log(`[enquiry email] to=${mail.to} subject="${mail.subject}"\n${mail.text}`);
  }
}
