import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    // Permite correr o gate contra produção: PW_BASE=https://trio-eletrico.vercel.app npm run test:mobile
    baseURL: process.env.PW_BASE || 'http://localhost:3000',
    headless: true,
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },
  webServer: process.env.PW_BASE ? undefined : {
    command: 'python3 -m http.server 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 10000,
  },
});
