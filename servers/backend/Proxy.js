import { readPostBodyPromise, handleUnzipPromise, isZipContent, readBody } from './requesttools.js';
import https from 'https';
import url from 'url';

const proxyRedirectHost = 'news360.com';

class Proxy {
  constructor(logger) {
    this.logger = logger;
  }

  async handleRequest(originalRequest, originalResponse) {
    this.logger.log(`start ${originalRequest.url}`);

    const sendRequestInfo = await this.prepareSendRequestInfo(originalRequest);
    const responseInfo = await this.prepareResponseInfoPromise(sendRequestInfo);
    this.logger.log(`end ${originalRequest.url}`);

    this.fillOriginalResponseInfo(originalResponse, responseInfo);
    return [sendRequestInfo, responseInfo];
  }

  async prepareSendRequestInfo(request) {
    const body = await readPostBodyPromise(request);
    return {
      options: this.getSendRequestOptions(request),
      body,
    };
  }

  fillOriginalResponseInfo(originalResponse, responseInfo) {
    originalResponse.writeHead(responseInfo.statusCode, responseInfo.headers);
    if (responseInfo.originalBody) {
      originalResponse.write(responseInfo.originalBody);
    }
    originalResponse.end();
  }

  getSendRequestOptions(req) {
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

    const options = {
      host,
      port: 443,
      path,
      method: req.method,
      headers,
    };

    return options;
  }

  async prepareResponseInfoPromise(sendRequestInfo) {
    const originalResponseInfo = await this.prepareOriginalResponseInfoPromise(sendRequestInfo);
    const responseInfo = await this.handleOriginalResponseEndPromise(originalResponseInfo);

    if (isZipContent(responseInfo.headers)) {
      this.logger.log(`content decoded for ${sendRequestInfo.options.path}`);
    }

    return responseInfo;
  }

  async prepareOriginalResponseInfoPromise(sendRequestInfo) {
    return new Promise((resolve, reject) => {
      this.prepareOriginalResponseInfo(sendRequestInfo, (responseInfo) => {
        resolve(responseInfo);
      });
    });
  }

  prepareOriginalResponseInfo(sendRequestInfo, callback) {
    // is used to build a db insert query
    // contains headers, statusCode, body and originalBody keys
    const responseInfo = {
    };

    const creq = https.request(sendRequestInfo.options, (cres) => {
      responseInfo.headers = this.buildPoxyHeaders(cres);
      responseInfo.statusCode = cres.statusCode;

      cres.on('close', () => {
        callback(responseInfo);
      });

      readBody(cres, (body) => {
        responseInfo.originalBody = body; // keep to return in originalResponse
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

  buildPoxyHeaders(cres) {
    const headers = cres.headers;
    if (cres.headers['content-type']) {
      headers['Content-Type'] = cres.headers['content-type'];
    }
    return headers;
  }

  async handleOriginalResponseEndPromise(responseInfo) {
    if (isZipContent(responseInfo.headers)) {
      return handleUnzipPromise(responseInfo.originalBody)
        .then(decoded => Object.assign({ body: decoded }, responseInfo));
    }

    const result = Object.assign({ body: responseInfo.originalBody }, responseInfo);
    return Promise.resolve(result);
  }
}

export default Proxy;
