import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import Request from 'Model/Request';
import { LoadRequestsOption } from 'Model/LoadRequestsOption';
import * as http from 'http';
import * as util from 'util';
import RequestTable from 'DB/RequestTable';
import ILogger, { LogLevel } from 'Logger/ILogger';

// SPEC:
//
// requests (POST)- fetch requests from db
// params:
//  urlRegexp   - regexp for url to filter
// response:
//  list of db objects with the requested fields

export default class ApiRequestsCommand implements ApiCommand {
  logger: ILogger;
  requestTable:RequestTable;

  constructor(requestTable: RequestTable, logger: ILogger) {
    this.requestTable = requestTable;
    this.logger = logger;
  }

  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    if (LoadRequestsOption.checkType(requestInfo.body)) {
      await this.handleRequests(requestInfo.body, res);
    } else {
      setResponse(res, 400, `Body is incorrect`);
    }

    return res;
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.components.length === 1 &&
    requestInfo.body != null &&
    requestInfo.method === 'POST' &&
    requestInfo.components[0] === 'requests';
  }

  async handleRequests(body: LoadRequestsOption, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.loadRequests(body)
    .then((rows: Request[]) => {
      return setResponse(res, 200, JSON.stringify(rows));
    });
  }

  async loadRequests(options: LoadRequestsOption): Promise<Request[]> {
    return this.requestTable.loadRequests(options);
  }
}
