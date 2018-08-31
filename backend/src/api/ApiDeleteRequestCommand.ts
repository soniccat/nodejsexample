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

export default class ApiDeleteRequestCommand implements ApiCommand {
  requestTable: RequestTable;
  logger: ILogger;

  constructor(requestTable: RequestTable, logger: ILogger) {
    this.requestTable = requestTable;
    this.logger = logger;
  }

  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    const id = parseInt(requestInfo.components[1], 10);
    await this.handleDeleteRequest(id, res);
    return res;
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.components.length === 2 &&
      requestInfo.body === undefined &&
      requestInfo.method === 'DELETE' &&
      requestInfo.components[0] === 'request';
  }

  async handleDeleteRequest(id: number, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.requestTable.deleteRequest(id)
    .then(() => {
      return setResponse(res, 200, '');
    });
  }
}
