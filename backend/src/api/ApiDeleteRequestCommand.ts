import { ApiCommand, setResponseHeader } from 'main/api/ApiCommand';
import ApiRequestInfo from 'main/api/ApiRequestInfo';
import * as http from 'http';
import * as util from 'util';
import RequestTable from 'main/RequestTable';
import { Request } from 'Model/Request';
import ILogger, { LogLevel } from 'main/logger/ILogger';

// SPEC:
//
// request/id  (POST)- create request
// params:
//  json representation of an object

export default class ApiDeleteRequestCommand implements ApiCommand {
  requestTable: RequestTable;
  logger: ILogger;

  constructor(requestTable: RequestTable, logger: ILogger) {
    this.requestTable = requestTable;
    this.logger = logger;
  }

  async run(requestInfo: ApiRequestInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    const id = parseInt(requestInfo.components[1], 10);
    await this.handleDeleteRequest(id, res);
    return res;
  }

  canRun(requestInfo: ApiRequestInfo): boolean {
    return requestInfo.components.length === 2 &&
      requestInfo.body === undefined &&
      requestInfo.method === 'DELETE' &&
      requestInfo.components[0] === 'request';
  }

  async handleDeleteRequest(id: number, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.requestTable.deleteRequestRow(id)
    .then(() => {
      setResponseHeader(res, 200, '');
    })
    .catch((err) => {
      this.logger.log(LogLevel.ERROR, `ApiDeleteRequestCommand.handleDeleteRequest error: ${util.inspect(err)}`);
      setResponseHeader(res, 500);
    })
    .then(() => {
      return res;
    });
  }
}
