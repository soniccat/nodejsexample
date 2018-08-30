import { readPostBodyPromise, handleUnzipPromise, isZipContent, readBody, getUrlString } from 'Utils/requesttools';
import ResponseInfo from 'Data/request/ResponseInfo';
import SendInfo, { extractSendInfo, SendInfoBuilder } from 'Data/request/SendInfo';
import ILogger, { LogLevel } from 'Logger/ILogger';
import * as https from 'https';
import * as url from 'url';
import * as http from 'http';
import * as util from 'util';
import { RequestInfo } from 'Data/request/RequestInfo';

class Proxy {
  logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  async handleRequest(sendInfo: SendInfo, originalResponse: http.ServerResponse): Promise<RequestInfo> {
    this.logger.log(LogLevel.DEBUG, `start ${getUrlString(sendInfo)}`);

    const responseInfo: ResponseInfo = await this.prepareResponseInfoPromise(sendInfo);
    this.logger.log(LogLevel.DEBUG, `end ${getUrlString(sendInfo)}`);

    this.fillOriginalResponseInfo(originalResponse, responseInfo);
    return { sendInfo, responseInfo };
  }

  fillOriginalResponseInfo(originalResponse: http.ServerResponse, responseInfo: ResponseInfo) {
    originalResponse.writeHead(responseInfo.statusCode, responseInfo.headers);
    if (responseInfo.originalBody) {
      originalResponse.write(responseInfo.originalBody);
    }
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
        .then(decoded => Object.assign(responseInfo, { body: decoded }));
    }

    const result = Object.assign(responseInfo, { body: responseInfo.originalBody });
    return Promise.resolve(result);
  }
}

export default Proxy;
