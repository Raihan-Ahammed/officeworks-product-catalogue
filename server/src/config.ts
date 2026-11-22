export interface AppConfig {
  port: number;
  fakeStoreApiBase: string;
  cacheTtlMs: number;
  salesInbox: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    port: Number(env.PORT ?? 4000),
    fakeStoreApiBase: env.FAKE_STORE_API_BASE ?? 'https://fakestoreapi.com',
    cacheTtlMs: Number(env.CACHE_TTL_MS ?? 300_000),
    salesInbox: env.SALES_INBOX ?? 'sales@example.com',
  };
}
