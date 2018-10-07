
export const IgnoreProxyStorageHeader = 'ignore-proxy-storage';

export default class Request {
  id?: number;
  url: string = '';
  port: number = 0;
  method: string = '';
  headers: {[index: string]: any} = {};
  body?: string | Buffer | object;
  responseStatus: number = 0;
  responseHeaders: {[index: string]: any} = {};
  responseBody?: string | Buffer | object;
  isStub: boolean = false;
  name: string = '';

  static checkType(obj: any): obj is Request {
    return typeof obj.url === `string`
    && typeof obj.port === `number`
    && typeof obj.method === `string`
    && obj.headers
    && typeof obj.responseStatus === `number`
    && obj.responseHeaders
    && typeof obj.isStub === `boolean`
    && typeof obj.name === 'string';
  }
}