import ILogger from 'main/logger/ILogger';

class EmptyLogger implements ILogger {
  log(...args: any[]): void {
  }

  canLog(...args: any[]): boolean {
    return true;
  }
}

export default EmptyLogger;
