import ILogger, { LogLevel } from 'main/logger/ILogger';

class LoggerCollection implements ILogger {
  loggers: ILogger[];

  constructor(loggers: ILogger[]) {
    this.loggers = loggers;
  }

  log(level: LogLevel, ...args: any[]) {
    for (const logger of this.loggers) {
      if (logger.canLog.apply(null, args)) {
        logger.log.apply(null, [level].concat(args));
        break;
      }
    }
  }

  canLog(...args: any[]): boolean {
    let canLog = false;
    for (const logger of this.loggers) {
      if (logger.canLog.apply(null, args)) {
        canLog = true;
        break;
      }
    }

    return canLog;
  }
}

export default LoggerCollection;
