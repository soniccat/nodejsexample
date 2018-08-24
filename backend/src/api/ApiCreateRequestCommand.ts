import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';
import * as util from 'util';
import RequestTable from 'DB/RequestTable';
import Request from 'Model/Request';
import ILogger, { LogLevel } from 'Logger/ILogger';

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
    requestInfo.body !== undefined &&
    requestInfo.method === 'POST' &&
    requestInfo.components[0] === 'request';
  }

  async handleCreateRequest(requestRow: Request, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.requestTable.writeRequest(requestRow)
    .then(this.requestTable.getLastInsertedIndex)
    .then((insertedId) => {
      const resBody = JSON.stringify(Object.assign({ id: insertedId }, requestRow));
      setResponse(res, 200, resBody);
    })
    .catch((err) => {
      this.logger.log(LogLevel.ERROR, `ApiCreateRequestCommand.handleCreateRequest error: ${util.inspect(err)}`);
      setResponse(res, 500);
    })
    .then(() => {
      return res;
    });
  }
}
