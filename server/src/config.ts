export interface AppConfig {
  port: number;
  fakeStoreApiBase: string;
  cacheTtlMs: number;
  salesInbox: string;
  emailProvider: 'smtp' | 'console';
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user?: string;
    pass?: string;
    from: string;
  };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    port: Number(env.PORT ?? 4000),
    fakeStoreApiBase: env.FAKE_STORE_API_BASE ?? 'https://fakestoreapi.com',
    cacheTtlMs: Number(env.CACHE_TTL_MS ?? 300_000),
    salesInbox: env.SALES_INBOX ?? 'sales@example.com',
    emailProvider: env.EMAIL_PROVIDER === 'console' ? 'console' : 'smtp',
    smtp: {
      host: env.SMTP_HOST ?? 'localhost',
      port: Number(env.SMTP_PORT ?? 1025),
      secure: env.SMTP_SECURE === 'true',
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
      from: env.MAIL_FROM ?? 'catalogue@localhost',
    },
  };
}
