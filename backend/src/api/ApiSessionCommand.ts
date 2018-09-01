import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ILogger from 'Logger/ILogger';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';
import SessionManager from 'main/session/SessionManager';

// SPEC:
//
// session (GET) - fetch info of the current session
// response:
//  SessionInfo

class ApiSessionCommand implements ApiCommand {
  logger: ILogger;
  manager: SessionManager;

  constructor(manager: SessionManager, logger: ILogger) {
    this.manager = manager;
    this.logger = logger;
  }

  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.fillResponse(res);
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.components.length === 1 &&
    requestInfo.body === undefined &&
    requestInfo.method === 'GET' &&
    requestInfo.components[0] === 'session';
  }

  async fillResponse(res: http.ServerResponse): Promise<http.ServerResponse> {
    return setResponse(res, 200, JSON.stringify(this.manager.sessionInfo()));
  }
}

export default ApiSessionCommand;
