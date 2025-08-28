import fetch from 'node-fetch';

export class PushoverNotifier {
  constructor(token, user, logger) {
    this.token = token;
    this.user  = user;
    this.logger = logger;
  }

  async notify(message) {
    const res = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      body: new URLSearchParams({
        token: this.token,
        user:  this.user,
        message,
      }),
    });
    if (!res.ok) throw new Error(`Pushover failed: ${res.statusText}`);
    this.logger.info('Pushover notification sent');
  }
}