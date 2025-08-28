import { AppointmentChecker } from './appointmentChecker.js';
import { Authenticator } from './authenticator.js';
import { BrowserFactory } from './browserFactory.js';
import { CloudflareHandler } from './cloudflareHandler.js';
import { AppConfig } from './config.js';
import { CookieStore } from './cookieStore.js';
import { Logger } from './logger.js';
import { PushoverNotifier } from './notifier.js';

(async () => {
  const cfg       = AppConfig;
  const logger    = new Logger(cfg.logFile);
  const notifier  = new PushoverNotifier(cfg.pushoverToken, cfg.pushoverUser, logger);
  const browserFac= new BrowserFactory(cfg, logger);
  const cookieSt  = new CookieStore(cfg.cookieFile, logger);
  const cfHandler = new CloudflareHandler(cfg.cloudflareDomain, cfg.clearanceTimeoutSec, logger);
  const auth      = new Authenticator(cfg.username, cfg.password, logger);
  const checker   = new AppointmentChecker(cfg.targetUrl, logger);

  let failures = 0;
  const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  while (true) {
    try {
      const context = await browserFac.launchPersistent();
      const page    = context.pages()[0] || await context.newPage();

      await cookieSt.load(context);

      await page.goto(cfg.targetUrl, { waitUntil: 'domcontentloaded' });
      const cleared = await cfHandler.waitForClearance(page);
      if (!cleared) throw new Error('Cloudflare clearance failed');

      await cookieSt.save(context);

      if (await checker.needsLogin(page)) {
        await auth.login(page);
        await cookieSt.save(context);
      }

      const found = await checker.checkSlots(page);
      if (found) {
        logger.info('Appointment slot found!');
        await notifier.notify('TLS France Appointment Found!');
        await checker.captureScreenshot(page, 'AppointmentFound');
        break;
      }

      failures = 0;
    } catch (err) {
      failures++;
      logger.error(`Run #${failures} failed: ${err.message}`);
      await notifier.notify(`Error: ${err.message}`);

      if (failures >= cfg.maxConsecutiveFailures) {
        logger.error('Max consecutive failures reached, exiting.');
        process.exit(1);
      }
    }

    const waitMs = rnd(cfg.minRetryMs, cfg.maxRetryMs);
    logger.info(`Waiting ${Math.round(waitMs/1000)}s till next run…`);
    await new Promise(r => setTimeout(r, waitMs));
  }
})();