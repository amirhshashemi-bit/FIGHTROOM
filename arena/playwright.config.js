import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  testMatch: 'browser-smoke.spec.js',
  timeout: 60000,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader'] }
  }
});
