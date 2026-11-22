import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { ConsoleEmailProvider } from './enquiries/EmailProvider.js';
import { FakeStoreSource } from './products/FakeStoreSource.js';

const config = loadConfig();
const source = new FakeStoreSource(config.fakeStoreApiBase, config.cacheTtlMs);
const emailer = new ConsoleEmailProvider();

createApp({ source, emailer, config }).listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
