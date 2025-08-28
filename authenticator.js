export class Authenticator {
  constructor(username, password, logger) {
    this.user = username;
    this.pass = password;
    this.logger = logger;
  }

  async login(page) {
    this.logger.info('Logging in…');
    await page.fill('#username', this.user);
    await page.fill('#password', this.pass);
    await page.click('#kc-login');
    await page.waitForTimeout(this._rand(15000, 20000));
  }

  _rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}