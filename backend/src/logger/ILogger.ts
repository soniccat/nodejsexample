
export enum LogLevel {
  DEBUG,
  WARNING,
  ERROR,
}

interface ILogger {
  log(level: LogLevel, ...args: any[]): void;
  canLog(...args: any[]): boolean;
}

export default ILogger;
