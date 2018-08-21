import { ApiCommand, setResponseHeader } from 'main/api/ApiCommand';
import ApiRequestInfo from 'main/api/ApiRequestInfo';
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

  async run(requestInfo: ApiRequestInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    if (LoadRequestsOption.checkType(requestInfo.body)) {
      await this.handleRequests(requestInfo.body, res);
    } else {
      setResponseHeader(res, 400, `Body is incorrect`);
    }

    return res;
  }

  canRun(requestInfo: ApiRequestInfo): boolean {
    return requestInfo.components.length > 0 &&
    requestInfo.body !== undefined &&
    requestInfo.method === 'POST' &&
    requestInfo.components[0] === 'requests';
  }

  async handleRequests(body: LoadRequestsOption, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.loadRequests(body)
    .then((rows: Request[]) => {
      setResponseHeader(res, 200, JSON.stringify(rows));
    })
    .catch((err) => {
      this.logger.log(LogLevel.ERROR, `LoadRequestsOption.handleRequests error: ${util.inspect(err)}`);
      setResponseHeader(res, 500);
    })
    .then(() => {
      return res;
    });
  }

  async loadRequests(options: LoadRequestsOption): Promise<Request[]> {
    return this.requestTable.loadRequests(options);
  }
}
