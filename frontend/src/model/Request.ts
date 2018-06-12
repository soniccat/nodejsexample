// TODO: use the same from backend (like contract)
export default interface Request {
  id?: number;
  url: string;
  port: number;
  method: string;
  headers: {
    [index: string]: any;
  };
  body: string | object | undefined;
  responseStatus: number;
  responseHeaders: {
    [index: string]: any;
  };
  responseBody: string | object | undefined;
  isStub: boolean;
}