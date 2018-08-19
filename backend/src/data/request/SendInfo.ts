import * as https from 'https';

class SendInfo {
  host: string;
  path: string;
  port: number;
  headers: {[header: string]: string | string[] | number | undefined};
  method: string;
  body?: string | Buffer | object;
}

export default SendInfo;
