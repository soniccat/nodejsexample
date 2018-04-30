import { readPostBodyPromise, readBodyPromise, readBody, logRequest } from './requesttools.js';
import https from 'https';
import url from 'url';
import zlib from 'zlib';

const gzip = zlib.createGzip();

const proxyRedirectHost = 'news360.com';

class Proxy {
  constructor(logger) {
    this.logger = logger;
  }

  handleRequest(originalRequest, originalResponse) {
    this.logger.log(`start ${originalRequest.url}`);

    return this.prepareRequestInfo(originalRequest)
      .then(sendRequestInfo => Promise.all([sendRequestInfo, this.prepareResponseInfoPromise(sendRequestInfo)]))
      .then(([sendRequestInfo, responseInfo]) => {
        this.logger.log(`end ${originalRequest.url}`);

        this.fillResponseInfo(originalResponse, responseInfo);
        return [sendRequestInfo, responseInfo];
      });
  }

  prepareRequestInfo(request) {
    return readPostBodyPromise(request)
      .then(body =>
        // is used to build a db insert query
        // contains options and body keys
        ({
          options: this.getRequestOptions(request),
          body,
        }));
  }

  fillResponseInfo(originalResponse, responseInfo) {
    originalResponse.writeHead(responseInfo.statusCode, responseInfo.headers);
    if (responseInfo.body) {
      originalResponse.write(responseInfo.body);
    }
    originalResponse.end();
  }

  getRequestOptions(req) {
    const reqUrl = url.parse(req.url);
    const redirectHost = proxyRedirectHost;
    const needRedirect = reqUrl.host == null || reqUrl.host === 'localhost';
    const host = needRedirect ? redirectHost : reqUrl.host;
    const path = reqUrl.path;
    const defaultHeaders = req.headers;

    defaultHeaders['accept-encoding'] = '';
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

  prepareResponseInfoPromise(sendRequestInfo) {
    return new Promise((resolve, reject) => {
      this.prepareResponseInfo(sendRequestInfo, (responseInfo, body) => {
        resolve([responseInfo, body]);
      });
    }).then(([responseInfo, body]) => this.handleResponseEndPromise(responseInfo, body))
      .then((responseInfo) => {
      if (this.isGzip(responseInfo.headers)) {
        this.logger.log('content decoded');
      }

      return responseInfo;
    });
  }

  prepareResponseInfo(sendRequestInfo, callback) {
    // is used to build a db insert query
    // contains headers, statusCode and body keys
    const responseInfo = {
    };

    const creq = https.request(sendRequestInfo.options, (cres) => {
      const headers = this.buildPoxyHeaders(cres);
      responseInfo.headers = headers;
      responseInfo.statusCode = cres.statusCode;

      cres.on('close', () => {
        callback(responseInfo, undefined);
      });

      readBody(cres, (body) => {
        callback(responseInfo, body);
      });
    }).on('error', (e) => {
      responseInfo.statusCode = 500;
      callback(responseInfo, undefined);
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

  handleResponseEndPromise(responseInfo, buffer) {
    responseInfo.body = buffer;

    return new Promise((resolve, reject) => {
      if (this.isGzip(responseInfo.headers)) {
        return this.handleUnzipPromise(buffer)
          .then((decoded) => {
            responseInfo.body = decoded;
            return responseInfo;
          });
      } else {
        resolve(responseInfo);
      }
    });
  }

  handleUnzipPromise(buffer) {
    return new Promise((resolve, reject) => {
      this.unzip(buffer, (decoded, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(decoded);
        }
      });
    });
  }

  unzip(buffer, completion) {
    zlib.unzip(buffer, (err, decoded) => {
      if (!err) {
        completion(decoded, undefined);
      } else {
        completion(undefined, err);
      }
    });
  }

  isGzip(headers) {
    const contentEncoding = headers['content-encoding'];
    let result = false;
    if (contentEncoding) {
      result = contentEncoding.indexOf('gzip') !== -1 || contentEncoding.indexOf('deflate') !== -1;
    }
    return result;
  }
}

export default Proxy;
