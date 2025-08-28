import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';

loadEnv();

const baseDir = resolve();
const timestamp = new Date().toISOString().replace(/[:.]/g, '_');

export const AppConfig = {
  chromePath: process.env.CHROME_PATH,
  targetUrl: process.env.TLS_URL,
  username: process.env.TLS_USER,
  password: process.env.TLS_PASS,
  pushoverToken: process.env.PUSHOVER_TOKEN,
  pushoverUser: process.env.PUSHOVER_USER,

  cloudflareDomain: 'tlscontact.com',
  clearanceTimeoutSec: 60,

  minRetryMs: 420_000,    // 7 minutes
  maxRetryMs: 600_000,    // 10 minutes
  maxConsecutiveFailures: 3,

  cookieFile: resolve(baseDir, 'cookies.json'),
  logFile:    resolve(baseDir, `log_${timestamp}.txt`),
};