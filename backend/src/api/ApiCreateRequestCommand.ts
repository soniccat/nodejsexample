import { ApiCommand, setResponseHeader } from 'main/api/ApiCommand';
import ApiRequestInfo from 'main/api/ApiRequestInfo';
import * as http from 'http';
import * as util from 'util';
import RequestTable, { RequestRow } from 'main/RequestTable';
import ILogger, { LogLevel } from 'main/logger/ILogger';

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

  async run(requestInfo: ApiRequestInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    if (!RequestRow.checkType(requestInfo.body)) {
      setResponseHeader(res, 400, `Body is incorrect`);
    } else {
      await this.handleCreateRequest(requestInfo.body, res);
    }

    return res;
  }

  canRun(requestInfo: ApiRequestInfo): boolean {
    return requestInfo.components.length === 0 &&
    requestInfo.body !== undefined &&
    requestInfo.components[0] === 'request';
  }

  async handleCreateRequest(requestRow: RequestRow, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.requestTable.writeRequestRow(requestRow)
    .then(this.requestTable.getLastInsertedIndex)
    .then((insertedId) => {
      const resBody = JSON.stringify(Object.assign({ id: insertedId }, requestRow));
      setResponseHeader(res, 200, resBody);
    })
    .catch((err) => {
      this.logger.log(LogLevel.ERROR, `ApiRequestCommand.handleCreateRequest error: ${util.inspect(err)}`);
      setResponseHeader(res, 500);
    })
    .then(() => {
      return res;
    });
  }
}
