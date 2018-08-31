import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ILogger, { LogLevel } from 'Logger/ILogger';
import { StubGroupTable } from 'DB/StubGroupTable';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';
import * as util from 'util';
import StubGroup from 'Model/StubGroup';
import SessionInfo from 'Model/SessionInfo';
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
    const sessionInfo: SessionInfo = {
      isActive: this.manager.isActive,
      stubGroupIds: this.manager.stubGroups.map(o => o.id),
    };

    return setResponse(res, 200, JSON.stringify(sessionInfo));
  }
}

export default ApiSessionCommand;
