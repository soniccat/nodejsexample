import util from 'util';
import zlib from "zlib";

export async function readPostBodyPromise(request) {
  return new Promise((resolve, reject) => {
    readPostBody(request, (buffer) => {
      resolve(buffer);
    });
  });
}

export function readPostBody(request, callback) {
  // console.log("### body " + util.inspect(originalRequest));
  if (request.method !== 'POST') {
    callback(undefined);
  } else {
    readBody(request, callback);
  }
}

export function readBody(request, callback) {
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

export function getUrlString(requestInfo) {
  const scheme = requestInfo.port === 443 ? 'https://' : 'http://';
  return scheme + requestInfo.options.host + (requestInfo.options.path ? requestInfo.options.path : '');
}

export async function handleUnzipPromise(buffer) {
  return new Promise((resolve, reject) => {
    unzip(buffer, (decoded, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(decoded);
      }
    });
  });
}

export function unzip(buffer, completion) {
  zlib.unzip(buffer, (err, decoded) => {
    if (!err) {
      completion(decoded, undefined);
    } else {
      completion(undefined, err);
    }
  });
}

export function isZipContent(headers) {
  const contentEncoding = headers['content-encoding'];
  let result = false;
  if (contentEncoding) {
    result = contentEncoding.indexOf('gzip') !== -1 || contentEncoding.indexOf('deflate') !== -1;
  }
  return result;
}