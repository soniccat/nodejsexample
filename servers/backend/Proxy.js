import { readPostBody, logRequest } from './requesttools.js';
import https from 'https';
import url from 'url';
import zlib from 'zlib';

const gzip = zlib.createGzip();

const proxyRedirectHost = 'news360.com';

class Proxy {
  constructor(logger) {
    this.logger = logger;
  }

  handleRequest(originalRequest, originalResponse, callback) {
    this.prepareRequestInfo(originalRequest, (sendRequestInfo) => {
      this.prepareResponseInfo(sendRequestInfo, (responseInfo) => {
        logRequest(sendRequestInfo, responseInfo, this.logger);

        originalResponse.writeHead(responseInfo.statusCode, responseInfo.headers);
        if (responseInfo.body) {
          originalResponse.write(responseInfo.body);
        }
        originalResponse.end();

        if (callback) {
          callback(sendRequestInfo, responseInfo);
        }
      });
    });
  }

  prepareRequestInfo(originalRequest, callback) {
    const options = this.getRequestOptions(originalRequest);

    // is used to build a db insert query
    // contains options and body keys
    const requestInfo = {
      options,
    };

    readPostBody(originalRequest, (body) => {
      if (body) {
        requestInfo.body = body;
      }

      callback(requestInfo);
    });
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

  prepareResponseInfo(sendRequestInfo, callback) {
    // is used to build a db insert query
    // contains headers, statusCode and body keys
    const responseInfo = {
    };

    const creq = https.request(sendRequestInfo.options, (cres) => {
      const headers = this.buildPoxyHeaders(cres);
      responseInfo.headers = headers;
      responseInfo.statusCode = cres.statusCode;

      const chunks = [];
      cres.on('data', (chunk) => {
        chunks.push(chunk);
      });

      cres.on('close', () => {
        callback(responseInfo);
      });

      cres.on('end', () => {
        const buffer = Buffer.concat(chunks);
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
