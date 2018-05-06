import ILogger from 'main/logger/ILogger';

class ConsoleLogger implements ILogger {
  log(...args: any[]): void {
    if (args && args.length) {
      for (const arg of args) {
        console.log(arg);
      }
    }
  }

  canLog(...args: any[]): boolean {
    return true;
  }
}

export default ConsoleLogger;
