import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';
import RequestTable from 'DB/RequestTable';
import Request from 'Model/Request';
import ILogger from 'Logger/ILogger';

// SPEC:
//
// request  (POST)- create request
// params:
//  json representation of an object

export default class ApiCreateRequestCommand implements ApiCommand {
  requestTable: RequestTable;
  logger: ILogger;

  constructor(requestTable: RequestTable, logger: ILogger) {
    this.requestTable = requestTable;
    this.logger = logger;
  }

  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    if (!Request.checkType(requestInfo.body)) {
      setResponse(res, 400, `Body is incorrect`);
    } else {
      await this.handleCreateRequest(requestInfo.body, res);
    }

    return res;
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.components.length === 1 &&
    requestInfo.body != null &&
    requestInfo.method === 'POST' &&
    requestInfo.components[0] === 'request';
  }

  async handleCreateRequest(requestRow: Request, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.requestTable.writeRequest(requestRow)
    .then(this.requestTable.getLastInsertedIndex)
    .then((insertedId) => {
      const resBody = JSON.stringify(Object.assign(requestRow, { id: insertedId }));
      return setResponse(res, 200, resBody);
    });
  }
}
