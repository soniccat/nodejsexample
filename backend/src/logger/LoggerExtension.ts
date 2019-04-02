import ILogger, { LogLevel } from 'Logger/ILogger';

class LoggerExtension implements ILogger {
  innerLogger: ILogger;

  constructor(logger: ILogger) {
    this.innerLogger = logger;
  }

  log(level: LogLevel, ...args: any[]) {
    if (this.innerLogger.canLog.apply(null, args)) {
      this.innerLogger.log.apply(null, [level, ...args]);
    }
  }

  canLog(...args: any[]): boolean {
    return this.innerLogger.canLog.apply(null, args);
  }
}

export default LoggerExtension;
