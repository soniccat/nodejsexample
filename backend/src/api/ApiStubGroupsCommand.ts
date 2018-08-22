import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ILogger, { LogLevel } from 'Logger/ILogger';
import { StubGroupTable } from 'DB/StubGroupTable';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';
import * as util from 'util';
import StubGroup from 'Model/StubGroup';

// SPEC:
//
// stubgroups (POST)- fetch requests from db
// response:
//  list of db objects

class ApiStubGroupsCommand implements ApiCommand {
  logger: ILogger;
  stubGroupsTable: StubGroupTable;

  constructor(stubGroupsTable: StubGroupTable, logger: ILogger) {
    this.stubGroupsTable = stubGroupsTable;
    this.logger = logger;
  }

  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.handleStubGroups(res);
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.components.length === 1 &&
    requestInfo.body === undefined &&
    requestInfo.method === 'GET' &&
    requestInfo.components[0] === 'stubgroups';
  }

  async handleStubGroups(res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.loadStubGroups()
    .then((rows: StubGroup[]) => {
      setResponse(res, 200, JSON.stringify(rows));
    })
    .catch((err) => {
      this.logger.log(LogLevel.ERROR, `LoadRequestsOption.handleRequests error: ${util.inspect(err)}`);
      setResponse(res, 500);
    })
    .then(() => {
      return res;
    });
  }

  async loadStubGroups(): Promise<StubGroup[]> {
    return this.stubGroupsTable.loadStubGroups();
  }
}

export default ApiStubGroupsCommand;
