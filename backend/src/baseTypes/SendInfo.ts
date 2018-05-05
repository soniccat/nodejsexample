import * as https from 'https';

class SendInfo {
  options: https.RequestOptions;
  body?: string | object;

  constructor(options, body) {
    this.options = options;
    this.body = body;
  }
}

export default SendInfo;
