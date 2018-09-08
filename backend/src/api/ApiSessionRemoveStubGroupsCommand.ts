import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ILogger from 'Logger/ILogger';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';
import SessionManager from 'main/session/SessionManager';

// SPEC:
//
// session/stubgroups (DELETE) - remove stub groups to session
// body:
//  {stubGroupIds:number[]}
// response:
//  SessionInfo

class ApiSessionRemoveStubGroupsCommand implements ApiCommand {
  logger: ILogger;
  manager: SessionManager;

  constructor(manager: SessionManager, logger: ILogger) {
    this.manager = manager;
    this.logger = logger;
  }

  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    const ids = (requestInfo.body as any).stubGroupIds;
    if (ids == null) {
      throw 'ApiSessionRemoveStubGroupsCommand wrong body, stubGroupId is not found';
    }

    return this.manager.stop(ids).then((o) => {
      return this.fillResponse(res);
    });
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.components.length === 2 &&
    requestInfo.body !== undefined &&
    requestInfo.method === 'DELETE' &&
    requestInfo.components[0] === 'session' &&
    requestInfo.components[1] === 'stubgroups';
  }

  async fillResponse(res: http.ServerResponse): Promise<http.ServerResponse> {
    return setResponse(res, 200, JSON.stringify(this.manager.sessionInfo()));
  }
}

export default ApiSessionRemoveStubGroupsCommand;
