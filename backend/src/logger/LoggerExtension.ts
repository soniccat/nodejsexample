import ILogger, { LogLevel } from 'main/logger/ILogger';

class LoggerExtension implements ILogger {
  innerLogger: ILogger;

  constructor(logger: ILogger) {
    this.innerLogger = logger;
  }

  log(level: LogLevel, ...args: any[]) {
    if (this.innerLogger.canLog.apply(null, args)) {
      this.innerLogger.log.apply(null, [level].concat(args));
    }
  }

  canLog(...args: any[]): boolean {
    return this.innerLogger.canLog.apply(null, args);
  }
}

export default LoggerExtension;
