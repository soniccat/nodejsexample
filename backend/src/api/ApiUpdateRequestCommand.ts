import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';
import * as util from 'util';
import RequestTable from 'DB/RequestTable';
import Request from 'Model/Request';
import ILogger, { LogLevel } from 'Logger/ILogger';

// SPEC:
//
// request/id  (POST)- create request
// params:
//  json representation of an object

export default class ApiUpdateRequestCommand implements ApiCommand {
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
      requestInfo.body.id = parseInt(requestInfo.components[1], 10);
      await this.handleUpdateRequest(requestInfo.body, res);
    }

    return res;
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.components.length === 2 &&
      requestInfo.body !== undefined &&
      requestInfo.method === 'POST' &&
      requestInfo.components[0] === 'request';
  }

  async handleUpdateRequest(requestRow: Request, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.requestTable.updateRequest(requestRow)
    .then(() => {
      setResponse(res, 200, '');
    })
    .catch((err) => {
      this.logger.log(LogLevel.ERROR, `ApiUpdateRequestCommand.handleUpdateRequest error: ${util.inspect(err)}`);
      setResponse(res, 500);
    })
    .then(() => {
      return res;
    });
  }
}
