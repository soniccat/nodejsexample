import { readPostBodyPromise, handleUnzipPromise, isZipContent, readBody } from 'main/requesttools';
import ResponseInfo from 'main/baseTypes/ResponseInfo';
import SendInfo from 'main/baseTypes/SendInfo';
import ILogger, { LogLevel } from 'main/logger/ILogger';
import * as https from 'https';
import * as url from 'url';
import * as http from 'http';
import * as util from 'util';
import { RequestInfo } from 'main/baseTypes/RequestInfo';

class Proxy {
  logger: ILogger;
  redirectHost: string;

  constructor(redirectHost: string, logger: ILogger) {
    this.redirectHost = redirectHost;
    this.logger = logger;
  }

  async handleRequest(originalRequest: http.IncomingMessage, originalResponse: http.ServerResponse): Promise<RequestInfo> {
    this.logger.log(LogLevel.DEBUG, `start ${originalRequest.url}`);

    const sendInfo: SendInfo = await this.prepareSendRequestInfo(originalRequest);
    const responseInfo: ResponseInfo = await this.prepareResponseInfoPromise(sendInfo);
    this.logger.log(LogLevel.DEBUG, `end ${originalRequest.url}`);

    this.fillOriginalResponseInfo(originalResponse, responseInfo);
    return { sendInfo, responseInfo };
  }

  async prepareSendRequestInfo(request: http.IncomingMessage): Promise<SendInfo> {
    const sendInfo = this.getSendInfo(request);
    sendInfo.body = await readPostBodyPromise(request);

    return sendInfo;
  }

  fillOriginalResponseInfo(originalResponse: http.ServerResponse, responseInfo: ResponseInfo) {
    originalResponse.writeHead(responseInfo.statusCode, responseInfo.headers);
    if (responseInfo.originalBody) {
      originalResponse.write(responseInfo.originalBody);
    }
  }

  getSendInfo(req: http.IncomingMessage): SendInfo {
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

  async prepareResponseInfoPromise(sendInfo: SendInfo): Promise<ResponseInfo> {
    const originalResponseInfo: ResponseInfo = await this.prepareOriginalResponseInfoPromise(sendInfo);
    const responseInfo: ResponseInfo = await this.handleOriginalResponseEndPromise(originalResponseInfo);

    if (isZipContent(responseInfo.headers)) {
      this.logger.log(LogLevel.DEBUG, `content decoded for ${sendInfo.path}`);
    }

    return responseInfo;
  }

  async prepareOriginalResponseInfoPromise(sendInfo: SendInfo): Promise<ResponseInfo> {
    return new Promise<ResponseInfo>((resolve, reject) => {
      this.prepareOriginalResponseInfo(sendInfo, (responseInfo: ResponseInfo) => {
        resolve(responseInfo);
      });
    });
  }

  prepareOriginalResponseInfo(sendInfo: SendInfo, callback: (responseInfo: ResponseInfo) => void) {
    const responseInfo: ResponseInfo = new ResponseInfo();

    const creq = https.request(sendInfo, (cres: http.IncomingMessage) => {
      responseInfo.headers = this.buildPoxyHeaders(cres);
      responseInfo.statusCode = cres.statusCode === undefined ? 500 : cres.statusCode;

      cres.on('close', () => {
        callback(responseInfo);
      });

      readBody(cres, (body) => {
        responseInfo.originalBody = body;
        callback(responseInfo);
      });
    }).on('error', (e) => {
      this.logger.log(LogLevel.ERROR, `prepareOriginalResponseInfo error ${util.inspect(e)}`);
      responseInfo.headers = {};
      responseInfo.statusCode = 500;
      callback(responseInfo);
    });

    if (sendInfo.body) {
      creq.write(sendInfo.body);
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
    if (responseInfo.originalBody && isZipContent(responseInfo.headers)) {
      return handleUnzipPromise(responseInfo.originalBody as Buffer)
        .then(decoded => Object.assign({ body: decoded }, responseInfo));
    }

    const result = Object.assign({ body: responseInfo.originalBody }, responseInfo);
    return Promise.resolve(result);
  }
}

export default Proxy;
