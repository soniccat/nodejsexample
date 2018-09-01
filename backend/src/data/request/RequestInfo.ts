import SendInfo from 'Data/request/SendInfo';
import ResponseInfo from 'Data/request/ResponseInfo';

export class RequestInfo {
  sendInfo: SendInfo = new SendInfo();
  responseInfo: ResponseInfo = new ResponseInfo();
}
