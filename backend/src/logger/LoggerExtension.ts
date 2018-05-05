import ILogger from 'main/logger/ILogger';

class LoggerExtension implements ILogger {
  innerLogger: ILogger;

  constructor(logger: ILogger) {
    this.innerLogger = logger;
  }

  log(...args: any[]) {
    if (this.innerLogger.canLog.apply(null, args)) {
      this.innerLogger.log.apply(null, args);
    }
  }

  canLog(...args: any[]): boolean {
    return this.innerLogger.canLog.apply(null, args);
  }
}

export default LoggerExtension;
