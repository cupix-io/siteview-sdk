import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:8081',
    headless: true
  },
  webServer: {
    command: 'npx webpack serve --config ./webpack-dev.config.js --no-open',
    port: 8081,
    reuseExistingServer: !process.env.CI
  }
});
