import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ILogger from 'Logger/ILogger';
import { StubGroupTable } from 'DB/StubGroupTable';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';
import StubGroup from 'Model/StubGroup';

// SPEC:
//
// stubgroups (POST) - fetch requests from db
// body:
//  {name: string}
// response:
//  StubGroup obj

class ApiCreateStubGroupCommand implements ApiCommand {
  logger: ILogger;
  stubGroupsTable: StubGroupTable;

  constructor(stubGroupsTable: StubGroupTable, logger: ILogger) {
    this.stubGroupsTable = stubGroupsTable;
    this.logger = logger;
  }

  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    const name = requestInfo.body instanceof Object ? requestInfo.body['name'] : undefined;
    if (name == null) {
      throw 'ApiCreateStubGroupCommand invalid body, name is not found';
    }

    return this.createStubGroup(name, res);
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.components.length === 1 &&
    requestInfo.method === 'POST' &&
    requestInfo.body != null &&
    requestInfo.components[0] === 'stubgroups';
  }

  async createStubGroup(name: string, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.stubGroupsTable.createStubGroup(name)
    .then((rows: StubGroup) => {
      return setResponse(res, 200, JSON.stringify(rows));
    });
  }
}

export default ApiCreateStubGroupCommand;
