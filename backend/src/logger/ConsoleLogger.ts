import ILogger, { LogLevel } from 'Logger/ILogger';

class ConsoleLogger implements ILogger {
  log(level: LogLevel, ...args: any[]): void {
    if (args && args.length) {
      for (const arg of args) {
        console.log(level, arg);
      }
    }
  }

  canLog(...args: any[]): boolean {
    return true;
  }
}

export default ConsoleLogger;
