import LoggerExtension from 'main/logger/LoggerExtension';
import ResponseInfo from 'main/baseTypes/ResponseInfo';
import SendInfo from 'main/baseTypes/SendInfo';
import * as util from 'util';
import { getUrlString } from 'main/requesttools';
import { RequestInfo } from 'main/baseTypes/RequestInfo';
import { LogLevel } from 'main/logger/ILogger';

class RequestLogger extends LoggerExtension {
  log(level: LogLevel, ...args: any[]): void {
    if (this.canLog.apply(args)) {
      this.logRequest(level, args[0] as RequestInfo);
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

  logRequest(level: LogLevel, requestInfo: RequestInfo) {
    this.innerLogger.log(level, `load ${getUrlString(requestInfo.sendInfo)}`);
    this.innerLogger.log(level, `send ${util.inspect(requestInfo.sendInfo)}`);
    this.innerLogger.log(level, `response ${util.inspect(requestInfo.sendInfo)}`);
  }
}

export default RequestLogger;
