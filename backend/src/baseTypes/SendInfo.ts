import * as https from 'https';

export class SendInfoOptions {
  host: string;
  path: string;
  port: number;
  headers: {[header: string]: string | string[] | number | undefined};
  method: string;
}

class SendInfo {
  options: SendInfoOptions;
  body?: string | Buffer | object;

  constructor(options: SendInfoOptions, body?: string | Buffer | object) {
    this.options = options;
    this.body = body;
  }
}

export default SendInfo;
