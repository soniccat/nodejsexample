import * as util from 'util';
import * as zlib from 'zlib';
import * as http from 'http';
import SendInfo from 'main/baseTypes/SendInfo';
import { isString } from 'main/objectTools';

export async function readPostBodyPromise(request: http.IncomingMessage): Promise<Buffer | null> {
  return new Promise<Buffer | null>((resolve, reject) => {
    readPostBody(request, (buffer: Buffer | null) => {
      resolve(buffer);
    });
  });
}

export function readPostBody(request: http.IncomingMessage, callback: (buffer?: Buffer) => void) {
  // console.log("### body " + util.inspect(originalRequest));
  if (request.method !== 'POST') {
    callback(undefined);
  } else {
    readBody(request, callback);
  }
}

export function readBody(request: http.IncomingMessage, callback: (buffer: Buffer) => void) {
  const sendPost = [];
  request.on('data', (chunk) => {
    sendPost.push(chunk);
  });

  request.on('end', () => {
    const buffer = Buffer.concat(sendPost);
    // console.log("post data " + buffer);
    callback(buffer);
  });
}

export function getUrlString(requestInfo: SendInfo) {
  const scheme = requestInfo.options.port === 443 ? 'https://' : 'http://';
  return scheme + requestInfo.options.host + (requestInfo.options.path ? requestInfo.options.path : '');
}

export async function handleUnzipPromise(buffer: zlib.InputType): Promise<Buffer | null> {
  return new Promise<Buffer | null>((resolve, reject) => {
    unzip(buffer, (decoded, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(decoded);
      }
    });
  });
}

export function unzip(buffer: zlib.InputType, completion: (result: Buffer | null, error: Error | null) => void) {
  zlib.unzip(buffer, (err, decoded: Buffer) => {
    if (!err) {
      completion(decoded, null);
    } else {
      completion(null, err);
    }
  });
}

export function isZipContent(headers: http.OutgoingHttpHeaders) {
  const contentEncoding = headers['content-encoding'];
  let result = false;
  if (isString(contentEncoding)) {
    const string = contentEncoding as string;
    result = string.indexOf('gzip') !== -1 || string.indexOf('deflate') !== -1;
  }
  return result;
}
