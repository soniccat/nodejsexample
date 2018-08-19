import ILogger, { LogLevel } from 'Logger/ILogger';

class EmptyLogger implements ILogger {
  log(level: LogLevel, ...args: any[]): void {
  }

  canLog(...args: any[]): boolean {
    return true;
  }
}

export default EmptyLogger;
