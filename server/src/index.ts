import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { ConsoleEmailProvider, type EmailProvider } from './enquiries/EmailProvider.js';
import { SmtpEmailProvider } from './enquiries/SmtpEmailProvider.js';
import { FakeStoreSource } from './products/FakeStoreSource.js';

const config = loadConfig();
const source = new FakeStoreSource(config.fakeStoreApiBase, config.cacheTtlMs);
const emailer: EmailProvider =
  config.emailProvider === 'console'
    ? new ConsoleEmailProvider()
    : new SmtpEmailProvider(config.smtp);

createApp({ source, emailer, config }).listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
