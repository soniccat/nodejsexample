import SendInfo from 'Data/request/SendInfo';
import ResponseInfo from 'Data/request/ResponseInfo';
import Request from 'Model/Request';
import { getUrlString } from 'Utils/requesttools';

export class RequestInfo {
  sendInfo: SendInfo = new SendInfo();
  responseInfo: ResponseInfo = new ResponseInfo();

  constructor(sendInfo: SendInfo, responseInfo: ResponseInfo) {
    this.sendInfo = sendInfo;
    this.responseInfo = responseInfo;
  }

  toRequest(name: string): Request {
    return {
      name,
      url: getUrlString(this.sendInfo),
      port: this.sendInfo.port,
      method: this.sendInfo.method,
      headers: this.sendInfo.headers,
      body: this.sendInfo.body,
      responseStatus: this.responseInfo.statusCode,
      responseHeaders: this.responseInfo.headers,
      responseBody: this.responseInfo.body,
      isStub: false};
  }
}
