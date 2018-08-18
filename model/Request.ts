export class Request {
  id?: number;
  url: string;
  port: number;
  method: string;
  headers: {[index: string]: any};
  body: string | object | undefined;
  responseStatus: number;
  responseHeaders: {[index: string]: any};
  responseBody: string | object | undefined;
  isStub: boolean;

  static checkType(obj): obj is Request {
    return typeof obj.url === `string`
    && typeof obj.port === `number`
    && typeof obj.method === `string`
    && obj.headers
    && typeof obj.responseStatus === `number`
    && obj.responseHeaders
    && typeof obj.isStub === `boolean`;
  }
}