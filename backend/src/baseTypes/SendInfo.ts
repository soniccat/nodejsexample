import * as https from 'https';

class SendInfoOptions {
  host: string;
  path: string;
  port: number;
  headers: {[header: string]: string | number | undefined};
  method: string;
}

class SendInfo {
  options: SendInfoOptions;
  body?: string | Buffer | object;

  constructor(options, body) {
    this.options = options;
    this.body = body;
  }
}

export default SendInfo;
