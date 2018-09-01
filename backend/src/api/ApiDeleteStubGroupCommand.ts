import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ILogger from 'Logger/ILogger';
import { StubGroupTable } from 'DB/StubGroupTable';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';
import StubGroup from 'Model/StubGroup';

// SPEC:
//
// stubgroups/id (DELETE) - fetch requests from db
// response:
//  none

class ApiDeleteStubGroupCommand implements ApiCommand {
  logger: ILogger;
  stubGroupsTable: StubGroupTable;

  stubGroupId: number;

  constructor(stubGroupsTable: StubGroupTable, logger: ILogger) {
    this.stubGroupsTable = stubGroupsTable;
    this.logger = logger;
  }

  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    this.stubGroupId = parseInt(requestInfo.components[1], 10);
    return this.handleDeleteStubGroup(res);
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.components.length === 2 &&
    requestInfo.method === 'DELETE' &&
    requestInfo.components[0] === 'stubgroups';
  }

  async handleDeleteStubGroup(res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.createStubGroup()
    .then((rows: StubGroup) => {
      return setResponse(res, 200, JSON.stringify(rows));
    });
  }

  async createStubGroup(): Promise<StubGroup> {
    return this.stubGroupsTable.deleteStubGroup(this.stubGroupId);
  }
}

export default ApiDeleteStubGroupCommand;
