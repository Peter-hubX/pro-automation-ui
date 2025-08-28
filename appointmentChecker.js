export class AppointmentChecker {
  constructor(url, logger) {
    this.url = url;
    this.logger = logger;
  }

  _rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async needsLogin(page) {
    return page.locator('h2#form-title').isVisible();
  }

  async checkSlots(page) {
    this.logger.info('Checking for appointment slots…');
    this.logger.info('Navigating to appointment page…');
    await page.goto(this.url, { waitUntil: 'domcontentloaded' });

    this.logger.info('Checking Cloudflare clearance…');
    await page.waitForTimeout(this._rand(3000, 5000));

    const noEn = page.locator('text=Sorry, there is no available appointment');
    const noFr = page.locator('text=Désolé, il n\'y a pas de rendez-vous disponible');

    if (await noEn.isVisible() || await noFr.isVisible()) {
      this.logger.info('No appointment popup detected.');
      return false;
    }

    const headingLocator = page.locator('.tls-appointment-month-slot h2');
    const headingCount = await headingLocator.count();

    if (headingCount === 0) {
      this.logger.info('No slot headings found.');
      return false;
    }

    const headingText = await headingLocator.first().innerText();
    this.logger.info(`Heading text: "${headingText}"`);

    if (!headingText || headingText.trim().length === 0) {
      this.logger.info('Slot heading is empty.');
      return false;
    }

    this.logger.info(`Slot heading detected: "${headingText}"`);
    return true;
  }
}