import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ILogger from 'Logger/ILogger';
import { StubGroupTable } from 'DB/StubGroupTable';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';

// SPEC:
//
// stubgroups/<groupId>/requests/<requestId> (DELETE) - fetch requests from db
// response:
//  none

class ApiDeleteRequestInStubGroupCommand implements ApiCommand {
  logger: ILogger;
  stubGroupsTable: StubGroupTable;

  constructor(stubGroupsTable: StubGroupTable, logger: ILogger) {
    this.stubGroupsTable = stubGroupsTable;
    this.logger = logger;
  }

  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    const stubGropupId = parseInt(requestInfo.components[1], 10);
    const requestId = parseInt(requestInfo.components[3], 10);

    if (stubGropupId == null || requestId == null) {
      throw 'ApiDeleteRequestInStubGroupCommand wrong url parameters stubGropupId=${stubGropupId} requestId=${requestId}';
    }

    return this.handleStubGroups(stubGropupId, requestId, res);
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.components.length === 4 &&
    requestInfo.method === 'DELETE' &&
    requestInfo.components[0] === 'stubgroups' &&
    requestInfo.components[2] === 'requests';
  }

  async handleStubGroups(stubGropupId: number, requestId: number, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.stubGroupsTable.deleteRequest(stubGropupId, requestId)
    .then((rows) => {
      return setResponse(res, 200, JSON.stringify(rows));
    });
  }
}

export default ApiDeleteRequestInStubGroupCommand;
