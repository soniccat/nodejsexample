import ILogger, { LogLevel } from 'Logger/ILogger';

class LoggerCollection implements ILogger {
  // call log.apply for the first logger in a group, do that for every group
  loggerGroups: ILogger[][];

  constructor(loggerGroups: ILogger[][]) {
    this.loggerGroups = loggerGroups;
  }

  log(level: LogLevel, ...args: any[]) {
    for (const loggers of this.loggerGroups) {
      for (const logger of loggers) {
        if (logger.canLog.apply(logger, args)) {
          logger.log.apply(logger, [level, ...args]);
          break;
        }
      }
    }
  }

  canLog(...args: any[]): boolean {
    let canLog = false;
    for (const loggers of this.loggerGroups) {
      for (const logger of loggers) {
        if (logger.canLog.apply(logger, args)) {
          canLog = true;
          break;
        }
      }

      if (canLog) {
        break;
      }
    }

    return canLog;
  }
}

export default LoggerCollection;
