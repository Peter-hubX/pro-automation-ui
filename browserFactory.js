import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-extra';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class BrowserFactory {
  constructor(cfg, logger) {
    this.cfg = cfg;
    this.logger = logger;
  }

  async launchPersistent() {
    const userDataDir = `${__dirname}/playwright-profile`;
    mkdirSync(userDataDir, { recursive: true });

    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      executablePath: this.cfg.chromePath,
      args: ['--disable-blink-features=AutomationControlled'],
      viewport: { width: 1366, height: 768 },
      locale: 'en-US',
    });

    this.logger.info('Launched browser context');
    await context.addInitScript(this._stealthScript());
    return context;
  }

  _stealthScript() {
    return `
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });
      Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      navigator.permissions.query = params =>
        params.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission })
          : Promise.resolve({ state: 'prompt' });
    `;
  }
}