import * as util from 'util';
import * as zlib from 'zlib';
import * as http from 'http';
import SendInfo from 'Data/request/SendInfo';
import { isString, isObject } from 'Utils/objectTools';

export async function readPostBodyPromise(request: http.IncomingMessage): Promise<Buffer | undefined> {
  return new Promise<Buffer | undefined>((resolve, reject) => {
    readPostBody(request, (buffer: Buffer | undefined) => {
      resolve(buffer);
    });
  });
}

export function readPostBody(request: http.IncomingMessage, callback: (buffer?: Buffer | string | object) => void) {
  if (request.method !== 'POST') {
    callback(undefined);
  } else {
    readBody(request, buffer => callback(processBuffer(buffer)));
  }
}

export function readBody(request: http.IncomingMessage, callback: (buffer: Buffer | string | undefined) => void) {
  const bufferData: Buffer[] = [];
  const stringData: string[] = [];

  request.on('data', (chunk) => {
    if (isString(chunk)) {
      stringData.push(chunk as string);
    } else {
      bufferData.push(chunk as Buffer);
    }
  });

  request.on('end', () => {
    let result: Buffer | string | undefined;
    if (stringData.length) {
      result = stringData.join();
    } else if (bufferData.length) {
      result = Buffer.concat(bufferData);
    } else {
      result = undefined;
    }

    callback(result);
  });
}

export function processBuffer(body: any): Buffer | string | object | undefined {
  let result: Buffer | string | object | undefined;
  const isBufferResponse = body instanceof Buffer;
  if (isBufferResponse) {
    // TODO: find a better way to work with string buffer
    const buffer: Buffer = body as Buffer;
    const isResponseBodyString = isBufferResponse && isValidUTF8Buffer(buffer);
    if (isResponseBodyString) {
      const responseString = buffer.toString();
      const jsonObj = tryParseJsonString(responseString);
      if (jsonObj) {
        result = jsonObj;
      } else {
        result = responseString;
      }
    } else {
      // TODO: need to support blobs
      // response_data = body;
      result = body;
    }
  } else {
    const isStr = isString(body);
    if (isStr) {
      const jsonObj = tryParseJsonString(body as string);
      if (jsonObj) {
        result = jsonObj;
      } else {
        result = body;
      }
    } else {
      result = body;
    }
  }

  return result;
}

export function isBodyJson(body: Buffer | string | object | undefined): boolean {
  return isObject(body);
}

export function bodyToString(body: Buffer | string | object | undefined): string | undefined {
  let result: Buffer | string | object | undefined = undefined;
  const isObj = isObject(body);
  if (isObj) {
    result = JSON.stringify(body);
  } else if (isString(body)) {
    result = body;
  } else if (body instanceof Buffer) {
    result = body.toString();
  }

  return result;
}

function tryParseJsonString(str: string): any {
  let parsed: any;
  try {
    parsed = JSON.parse(str);
  } catch (e) {
    parsed = undefined;
  }

  return parsed;
}

function isValidUTF8Buffer(buf: Buffer) {
  return Buffer.compare(new Buffer(buf.toString(), 'utf8'), buf) === 0;
}

export function getUrlString(requestInfo: SendInfo) {
  const scheme = requestInfo.port === 443 ? 'https://' : 'http://';
  return scheme + requestInfo.host + (requestInfo.path ? requestInfo.path : '');
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
