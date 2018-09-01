import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ILogger from 'Logger/ILogger';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';
import SessionManager from 'main/session/SessionManager';

// SPEC:
//
// session/stubgroups (POST) - add stub groups to session
// body:
//  {stubGroupIds:number[]}
// response:
//  SessionInfo

interface MyType {
  'stubGroupIds': number[];
}

interface MyTypeConstructor {
  new (o: any): MyType;
  readonly prototype: MyType;
}

declare var MyType: MyTypeConstructor;

class ApiSessionAddStubGroupsCommand implements ApiCommand {
  logger: ILogger;
  manager: SessionManager;

  constructor(manager: SessionManager, logger: ILogger) {
    this.manager = manager;
    this.logger = logger;
  }

  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    const ids = requestInfo.body instanceof MyType ? requestInfo.body['stubGroupIds'] : undefined;
    if (ids == null) {
      throw 'ApiSessionAddStubGroupsCommand wrong body, stubGroupId is not found';
    }

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
