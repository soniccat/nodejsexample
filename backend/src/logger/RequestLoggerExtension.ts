import LoggerExtension from 'main/logger/LoggerExtension';
import ResponseInfo from 'main/baseTypes/ResponseInfo';
import SendInfo from 'main/baseTypes/SendInfo';
import * as util from 'util';
import { getUrlString } from 'main/requesttools';

class RequestLogger extends LoggerExtension {
  log(...args: any[]): void {
    if (this.canLog(args)) {
      const sendInfo: SendInfo = args[0];
      const responseInfo: ResponseInfo = args[1];

      this.logRequest(args[0], args[1]);
    }
  }

  canLog(...args: any[]): boolean {
    let canLog = false;
    if (args && args.length > 1) {
      if (args[0] instanceof SendInfo && args[1] instanceof ResponseInfo) {
        canLog = true;
      }
    }

    return canLog;
  }

  logRequest(sendRequestInfo: SendInfo, responseInfo: ResponseInfo) {
    this.innerLogger.log(`load ${getUrlString(sendRequestInfo)}`);
    this.innerLogger.log(`send ${util.inspect(sendRequestInfo)}`);
    this.innerLogger.log(`response ${util.inspect(responseInfo)}`);
  }
}

export default RequestLogger;
