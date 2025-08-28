export class CloudflareHandler {
  constructor(domain, timeoutSec, logger) {
    this.domain = domain;
    this.timeoutMs = timeoutSec * 1000;
    this.logger = logger;
  }

  async waitForClearance(page) {
    const deadline = Date.now() + this.timeoutMs;
    let challengeSeen = false;

    // Headless evasion: mask automation fingerprint
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    while (Date.now() < deadline) {
      await page.waitForTimeout(this._randomDelay(3000, 5000));

      // Check for clearance cookie
      const cookies = await page.context().cookies();
      const isCleared = cookies.some(c => c.name === 'cf_clearance' && c.domain.includes(this.domain));
      if (isCleared) {
        this.logger.info('✅ Clearance cookie found — Cloudflare passed');
        return true;
      }

      // Detect Turnstile widget
      const turnstileVisible = await page.locator("label.cb-lb >> text=Verify you are human").isVisible();
      if (turnstileVisible) {
        this.logger.error('🛑 Turnstile challenge detected — manual verification required');
        await this._captureFailure(page, 'turnstile_widget');
        return false;
      }

      // Detect CAPTCHA iframe
      const captchaVisible = await page.locator("iframe[src*='challenge']").isVisible();
      if (captchaVisible) {
        this.logger.error('❌ CAPTCHA challenge detected — cannot bypass automatically');
        await this._captureFailure(page, 'captcha_detected');
        return false;
      }

      // Detect JS challenge text
      const jsChallengeVisible = await page.locator('text=Checking your browser before accessing').isVisible();
      if (jsChallengeVisible) {
        if (!challengeSeen) {
          this.logger.info('⏳ JavaScript challenge detected — waiting for clearance...');
          challengeSeen = true;
        }
        continue;
      }

      // Detect real page content
      const contentReady = await page.locator('.tls-appointment-month-slot').isVisible();
      if (contentReady) {
        this.logger.info('✅ Page content loaded — assuming Cloudflare passed');
        return true;
      }
    }

    this.logger.error('⏱️ Timeout reached — Cloudflare clearance failed');
    await this._captureFailure(page, 'cf_timeout');
    return false;
  }

  async injectClearanceCookie(context, cookieValue) {
    await context.addCookies([
      {
        name: 'cf_clearance',
        value: cookieValue,
        domain: this.domain,
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'Lax'
      }
    ]);
    this.logger.info('🍪 Clearance cookie injected into session');
  }

  _randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async _captureFailure(page, label) {
    try {
      const path = `Screenshots/${label}_${Date.now()}.png`;
      await page.screenshot({ path, fullPage: true });
      this.logger.info(`📸 Screenshot saved: ${path}`);
    } catch (err) {
      this.logger.error(`⚠️ Failed to capture screenshot: ${err.message}`);
    }
  }
}