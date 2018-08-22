import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import { Request } from 'Model/Request';
import { LoadRequestsOption } from 'Model/LoadRequestsOption';
import * as http from 'http';
import * as util from 'util';
import RequestTable from 'DB/RequestTable';
import ILogger, { LogLevel } from 'Logger/ILogger';

// SPEC:
//
// requests (POST)- fetch requests from db
// params:
//  fields    - required fields in a string array
//  urlRegexp   - regexp for url to filter
//  onlyNotNull - show only when every field is not null
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
    requestInfo.body !== undefined &&
    requestInfo.method === 'POST' &&
    requestInfo.components[0] === 'requests';
  }

  async handleRequests(body: LoadRequestsOption, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.loadRequests(body)
    .then((rows: Request[]) => {
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

  async loadRequests(options: LoadRequestsOption): Promise<Request[]> {
    return this.requestTable.loadRequests(options);
  }
}
