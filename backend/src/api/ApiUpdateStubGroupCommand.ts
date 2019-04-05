import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';
import StubGroupTable from 'DB/StubGroupTable';
import StubGroup from 'Model/StubGroup';
import ILogger from 'Logger/ILogger';

// SPEC:
//
// stubgroups/id  (POST)- create request
// params:
//  json representation of an object

export default class ApiUpdateStubGroupCommand implements ApiCommand {
  stubGroupTable: StubGroupTable;
  logger: ILogger;

  constructor(requestTable: StubGroupTable, logger: ILogger) {
    this.stubGroupTable = requestTable;
    this.logger = logger;
  }

  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    if (!StubGroup.checkType(requestInfo.body)) {
      setResponse(res, 400, 'Body is incorrect');
    } else {
      requestInfo.body.id = parseInt(requestInfo.components[1], 10);
      await this.handleUpdateRequest(requestInfo.body, res);
    }

    return res;
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.components.length === 2 &&
      requestInfo.body != null &&
      requestInfo.method === 'POST' &&
      requestInfo.components[0] === 'stubgroups';
  }

  async handleUpdateRequest(stubGroup: StubGroup, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.stubGroupTable.updateStubGroup(stubGroup)
    .then(() => {
      return setResponse(res, 200, '');
    });
  }
}
