import * as https from 'https';
import * as http from 'http';
import * as url from 'url';
import { readPostBodyPromise } from 'Utils/requesttools';

class SendInfo {
  host: string;
  path: string;
  port: number;
  headers: {[header: string]: string | string[] | number | undefined};
  method: string;
  body?: string | Buffer | object;
}

export async function extractSendInfo(request: http.IncomingMessage): Promise<SendInfo> {
  const sendInfo = this.getSendInfo(request);
  sendInfo.body = await readPostBodyPromise(request);

  return sendInfo;
}

export function getSendInfo(req: http.IncomingMessage): SendInfo {
  if (req.url === undefined) {
    throw new Error(`getSendInfo: url is empty`);
  }

  const reqUrl = url.parse(req.url);
  const redirectHost = this.redirectHost;

  if (reqUrl.host === undefined) {
    throw new Error(`getSendInfo: url host is empty ${reqUrl}`);
  }

  if (reqUrl.path === undefined) {
    throw new Error(`getSendInfo: url path is empty ${reqUrl}`);
  }

  const needRedirect = reqUrl.host == null || reqUrl.host === 'localhost';
  const host = needRedirect ? redirectHost : reqUrl.host;
  const path = reqUrl.path;
  const defaultHeaders = req.headers;

  defaultHeaders['accept-encoding'] = 'gzip';
  if (needRedirect) {
    defaultHeaders.host = redirectHost;
  }

  // to avoid caching
  delete defaultHeaders['if-modified-since'];
  delete defaultHeaders['if-none-match'];
  delete defaultHeaders.origin;
  delete defaultHeaders.referer;

  let headers = needRedirect ? defaultHeaders : req.headers;
  headers = headers ? headers : {};

  return {
    host,
    path,
    headers,
    port: 443,
    method: (req.method ? req.method : 'unknown'),
  };
}

export default SendInfo;
