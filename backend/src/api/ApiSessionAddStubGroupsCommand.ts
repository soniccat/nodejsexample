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
// session/stubgroups (POST) - add stub groups to session
// body:
//  {stubGroupIds:number[]}
// response:
//  SessionInfo

class ApiSessionAddStubGroupsCommand implements ApiCommand {
  logger: ILogger;
  manager: SessionManager;

  constructor(manager: SessionManager, logger: ILogger) {
    this.manager = manager;
    this.logger = logger;
  }

  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    const ids = requestInfo.body!['stubGroupIds'] as number[];
    return this.manager.start(ids).then((o) => {
      return this.fillResponse(res);
    });
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.components.length === 2 &&
    requestInfo.body !== undefined &&
    requestInfo.method === 'POST' &&
    requestInfo.components[0] === 'session' &&
    requestInfo.components[1] === 'stubgroups';
  }

  async fillResponse(res: http.ServerResponse): Promise<http.ServerResponse> {
    return setResponse(res, 200, JSON.stringify(this.manager.sessionInfo()));
  }
}

export default ApiSessionAddStubGroupsCommand;
