import ILogger, { LogLevel } from 'Logger/ILogger';
import { server } from 'websocket';

class WSLogger implements ILogger {
  server: server;

  constructor(aServer: server) {
    this.server = aServer;
  }

  log(level: LogLevel, ...args: any[]): void {
    if (args && args.length) {
      for (const arg of args) {
        this.server.connections.forEach((c) => {
          c.sendUTF(arg);
        });
      }
    }
  }

  canLog(...args: any[]): boolean {
    return this.server != null;
  }
}

export default WSLogger;
