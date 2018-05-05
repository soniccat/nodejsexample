
interface ILogger {
  log(...args: any[]): void;
  canLog(...args: any[]): boolean;
}

export default ILogger;
