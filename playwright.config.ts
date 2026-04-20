import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.PORT) || 4322;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: true,
  },
  webServer: {
    command: `ASTRO_TEST=1 npm run dev -- --port ${PORT}`,
    port: PORT,
    reuseExistingServer: true,
    timeout: 20_000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
