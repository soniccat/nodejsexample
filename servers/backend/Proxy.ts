import { readPostBodyPromise, handleUnzipPromise, isZipContent, readBody } from './requesttools.js';
import * as https from 'https';
import * as url from 'url';
import * as http from 'http';

interface Logger {
  log(value: string);
}

class SendInfo {
  options: https.RequestOptions;
  body?: any;

  constructor(options, body) {
    this.options = options;
    this.body = body;
  }
}

// is used to build a db insert query
class ResponseInfo {
  headers: http.OutgoingHttpHeaders;
  statusCode: number;
  body: any;          // unzipped body
  originalBody: any;  // to return original gzipped body

  constructor() {
  }
}

const proxyRedirectHost = 'news360.com';

class Proxy {
  logger: Logger;

  constructor(logger) {
    this.logger = logger;
  }

  async handleRequest(originalRequest: http.IncomingMessage, originalResponse: http.ServerResponse) {
    this.logger.log(`start ${originalRequest.url}`);

    const sendRequestInfo: SendInfo = await this.prepareSendRequestInfo(originalRequest);
    const responseInfo: ResponseInfo = await this.prepareResponseInfoPromise(sendRequestInfo);
    this.logger.log(`end ${originalRequest.url}`);

    this.fillOriginalResponseInfo(originalResponse, responseInfo);
    return [sendRequestInfo, responseInfo];
  }

  async prepareSendRequestInfo(request: http.IncomingMessage): Promise<SendInfo> {
    const body = await readPostBodyPromise(request);
    return new SendInfo(this.getSendRequestOptions(request), body);
  }

  fillOriginalResponseInfo(originalResponse: http.ServerResponse, responseInfo: ResponseInfo) {
    originalResponse.writeHead(responseInfo.statusCode, responseInfo.headers);
    if (responseInfo.originalBody) {
      originalResponse.write(responseInfo.originalBody);
    }
    originalResponse.end();
  }

  getSendRequestOptions(req): https.RequestOptions {
    const reqUrl = url.parse(req.url);
    const redirectHost = proxyRedirectHost;
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

    const headers = needRedirect ? defaultHeaders : req.headers;

    return {
      host,
      path,
      headers,
      port: 443,
      method: req.method,
    };
  }

  async prepareResponseInfoPromise(sendRequestInfo: SendInfo): Promise<ResponseInfo> {
    const originalResponseInfo: ResponseInfo = await this.prepareOriginalResponseInfoPromise(sendRequestInfo);
    const responseInfo: ResponseInfo = await this.handleOriginalResponseEndPromise(originalResponseInfo);

    if (isZipContent(responseInfo.headers)) {
      this.logger.log(`content decoded for ${sendRequestInfo.options.path}`);
    }

    return responseInfo;
  }

  async prepareOriginalResponseInfoPromise(sendRequestInfo: SendInfo): Promise<ResponseInfo> {
    return new Promise<ResponseInfo>((resolve, reject) => {
      this.prepareOriginalResponseInfo(sendRequestInfo, (responseInfo: ResponseInfo) => {
        resolve(responseInfo);
      });
    });
  }

  prepareOriginalResponseInfo(sendRequestInfo: SendInfo, callback: (responseInfo: ResponseInfo) => void) {
    const responseInfo: ResponseInfo = new ResponseInfo();

    const creq = https.request(sendRequestInfo.options, (cres: http.IncomingMessage) => {
      responseInfo.headers = this.buildPoxyHeaders(cres);
      responseInfo.statusCode = cres.statusCode;

      cres.on('close', () => {
        callback(responseInfo);
      });

      readBody(cres, (body) => {
        responseInfo.originalBody = body;
        callback(responseInfo);
      });
    }).on('error', (e) => {
      responseInfo.statusCode = 500;
      callback(responseInfo);
    });

    if (sendRequestInfo.body) {
      creq.write(sendRequestInfo.body);
    }

    creq.end();
  }

  buildPoxyHeaders(cres: http.IncomingMessage) {
    const headers = cres.headers;
    if (cres.headers['content-type']) {
      headers['Content-Type'] = cres.headers['content-type'];
    }
    return headers;
  }

  async handleOriginalResponseEndPromise(responseInfo: ResponseInfo) {
    if (isZipContent(responseInfo.headers)) {
      return handleUnzipPromise(responseInfo.originalBody)
        .then(decoded => Object.assign({ body: decoded }, responseInfo));
    }

    const result = Object.assign({ body: responseInfo.originalBody }, responseInfo);
    return Promise.resolve(result);
  }
}

export default Proxy;
