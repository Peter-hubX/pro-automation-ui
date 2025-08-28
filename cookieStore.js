import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export class CookieStore {
  constructor(path, logger) {
    this.path = path;
    this.logger = logger;
  }

  async load(context) {
    if (!existsSync(this.path)) return;
    try {
      const json = readFileSync(this.path, 'utf-8');
      const cookies = JSON.parse(json);
      await context.addCookies(cookies);
      this.logger.info('Loaded cookies from disk');
    } catch (err) {
      this.logger.error(`Failed to load cookies: ${err.message}`);
    }
  }

  async save(context) {
    try {
      const cookies = await context.cookies();
      writeFileSync(this.path, JSON.stringify(cookies, null, 2));
      this.logger.info('Saved cookies to disk');
    } catch (err) {
      this.logger.error(`Failed to save cookies: ${err.message}`);
    }
  }
}