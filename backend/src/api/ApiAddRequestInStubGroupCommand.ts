import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ILogger, { LogLevel } from 'Logger/ILogger';
import { StubGroupTable } from 'DB/StubGroupTable';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';
import * as util from 'util';
import StubGroup from 'Model/StubGroup';

// SPEC:
//
// stubgroups/<groupId>/requests/<requestId> (POST) - fetch requests from db
// body:
//  {}
// response:
//  none

class ApiAddRequestInStubGroupCommand implements ApiCommand {
  logger: ILogger;
  stubGroupsTable: StubGroupTable;

  requestId: number;
  stubGropupId: number;

  constructor(stubGroupsTable: StubGroupTable, logger: ILogger) {
    this.stubGroupsTable = stubGroupsTable;
    this.logger = logger;
  }

  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    this.stubGropupId = parseInt(requestInfo.components[1], 10);
    this.requestId = parseInt(requestInfo.components[3], 10);

    return this.handleStubGroups(res);
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.components.length === 4 &&
    requestInfo.method === 'POST' &&
    requestInfo.components[0] === 'stubgroups' &&
    requestInfo.components[2] === 'requests';
  }

  async handleStubGroups(res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.addRequestInStubGroup()
    .then((rows) => {
      setResponse(res, 200);
    })
    .catch((err) => {
      this.logger.log(LogLevel.ERROR, `ApiAddRequestInStubGroupCommand.handleStubGroups error: ${util.inspect(err)}`);
      setResponse(res, 500);
    })
    .then(() => {
      return res;
    });
  }

  async addRequestInStubGroup(): Promise<any> {
    return this.stubGroupsTable.addRequest(this.stubGropupId, this.requestId);
  }
}

export default ApiAddRequestInStubGroupCommand;
