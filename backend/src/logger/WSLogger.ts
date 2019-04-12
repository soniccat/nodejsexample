import ILogger, { LogLevel } from 'Logger/ILogger';
import { server } from 'websocket';
import { isString, isObject } from 'Utils/objectTools';

class WSLogger implements ILogger {
  server: server;

  constructor(aServer: server) {
    this.server = aServer;
  }

  log(level: LogLevel, ...args: any[]): void {
    if (args && args.length) {
      for (const arg of args) {
        this.server.connections.forEach((c) => {
          c.sendUTF(this.createMessage(arg));
        });
      }
    }
  }

  createMessage(arg: any): string {
    let resData: string;
    if (isString(arg)) {
      resData = arg;
    } else if (isObject(arg)) {
      resData = JSON.stringify(arg);
    } else {
      resData = 'unknown message';
    }

    return JSON.stringify({ type: 'message', data: resData });
  }

  canLog(...args: any[]): boolean {
    let argsValid = true;
    for (const v of args) {
      if (!isString(v) && !isObject(v)) {
        argsValid = false;
      }
    }

    return argsValid && this.server != null;
  }
}

export default WSLogger;
