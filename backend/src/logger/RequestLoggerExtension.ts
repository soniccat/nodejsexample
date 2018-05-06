import LoggerExtension from 'main/logger/LoggerExtension';
import ResponseInfo from 'main/baseTypes/ResponseInfo';
import SendInfo from 'main/baseTypes/SendInfo';
import * as util from 'util';
import { getUrlString } from 'main/requesttools';
import { RequestInfo } from 'main/baseTypes/RequestInfo';

class RequestLogger extends LoggerExtension {
  log(...args: any[]): void {
    if (this.canLog.apply(args)) {
      this.logRequest(args[0] as RequestInfo);
    }
  }

  canLog(...args: any[]): boolean {
    let canLog = false;
    if (args && args.length > 0) {
      if (args[0] instanceof RequestInfo) {
        canLog = true;
      }
    }

    return canLog;
  }

  logRequest(requestInfo: RequestInfo) {
    this.innerLogger.log(`load ${getUrlString(requestInfo.sendInfo)}`);
    this.innerLogger.log(`send ${util.inspect(requestInfo.sendInfo)}`);
    this.innerLogger.log(`response ${util.inspect(requestInfo.sendInfo)}`);
  }
}

export default RequestLogger;
