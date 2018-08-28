import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ILogger, { LogLevel } from 'Logger/ILogger';
import { StubGroupTable } from 'DB/StubGroupTable';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';
import * as util from 'util';
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

  name: string;

  constructor(stubGroupsTable: StubGroupTable, logger: ILogger) {
    this.stubGroupsTable = stubGroupsTable;
    this.logger = logger;
  }

  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    this.name = requestInfo.body!['name'];
    return this.handleCreateStubGroup(res);
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.components.length === 1 &&
    requestInfo.method === 'POST' &&
    requestInfo.body != null &&
    requestInfo.components[0] === 'stubgroups';
  }

  async handleCreateStubGroup(res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.createStubGroup()
    .then((rows: StubGroup) => {
      setResponse(res, 200, JSON.stringify(rows));
    })
    .catch((err) => {
      this.logger.log(LogLevel.ERROR, `ApiCreateStubGroupCommand.handleStubGroups error: ${util.inspect(err)}`);
      setResponse(res, 500);
    })
    .then(() => {
      return res;
    });
  }

  async createStubGroup(): Promise<StubGroup> {
    return this.stubGroupsTable.createStubGroup(this.name);
  }
}

export default ApiCreateStubGroupCommand;
