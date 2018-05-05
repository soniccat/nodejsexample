import ILogger from 'main/logger/ILogger';

class LoggerExtension implements ILogger {
  innerLogger: ILogger;

  constructor(logger: ILogger) {
    this.innerLogger = logger;
  }

  log(...args: any[]) {
    if (this.innerLogger.canLog(args)) {
      this.innerLogger.log(args);
    }
  }

  canLog(...args: any[]): boolean {
    return this.innerLogger.canLog(args);
  }
}

export default LoggerExtension;
