import LoggerExtension from 'Logger/LoggerExtension';
import * as util from 'util';
import { getUrlString } from 'Utils/requesttools';
import { RequestInfo } from 'Data/request/RequestInfo';
import { LogLevel } from 'Logger/ILogger';

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
