import { appendFileSync } from 'node:fs';

export class Logger {
  constructor(logFile) {
    this.logFile = logFile;
  }

  info(msg)  { this._write('INFO', msg); }
  error(msg) { this._write('ERROR', msg); }

  _write(level, msg) {
    const line = `[${new Date().toISOString()}] ${level}: ${msg}\n`;
    console.log(line.trim());
    appendFileSync(this.logFile, line);
  }
}