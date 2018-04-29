import { readPostBodyPromise, readPostBody, readBody, logRequest } from './requesttools.js';
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
    return this.prepareRequestInfo(originalRequest)
      .then(sendRequestInfo => Promise.all([sendRequestInfo, this.prepareResponseInfoPromise.call(this, sendRequestInfo)]))
      .then(([sendRequestInfo, responseInfo]) => {
        logRequest(sendRequestInfo, responseInfo, this.logger);
        this.fillResponseInfo(originalResponse, responseInfo);
        return [sendRequestInfo, responseInfo];
      });
  }

  prepareRequestInfo(request) {
    return readPostBodyPromise(request)
      .then((body) => {
        // is used to build a db insert query
        // contains options and body keys
        return {
          options: this.getRequestOptions(request),
          body: body,
        };
      });
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
      this.prepareResponseInfo(sendRequestInfo, (responseInfo) => {
        resolve(responseInfo);
      });
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
        callback(responseInfo);
      });

      readBody(cres, (buffer) => {
        this.handleRequestEnd(cres, buffer, (data) => {
          responseInfo.body = data;
          callback(responseInfo);
        });
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

  handleRequestEnd(request, buffer, callback) {
    this.handleGzip(request, buffer, (data) => {
      callback(data);
    });
  }

  handleGzip(cres, buffer, completion) {
    const contentEncoding = cres.headers['content-encoding'];
    if (contentEncoding) {
      const isGzip = contentEncoding.indexOf('gzip') !== -1 || contentEncoding.indexOf('deflate') !== -1;
      if (isGzip) {
        zlib.unzip(buffer, (err, decoded) => {
          this.logger.log('decoding...');
          if (!err) {
            this.logger.log('decoded');
            completion(decoded, undefined);
          } else {
            this.logger.log(`error ${err}`);
            completion(undefined, err);
          }
        });
      } else {
        completion(buffer, undefined);
      }
    } else {
      completion(buffer, undefined);
    }
  }
}

export default Proxy;
