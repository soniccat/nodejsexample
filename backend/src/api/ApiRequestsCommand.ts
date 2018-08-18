import { ApiCommand, setResponseHeader } from 'main/api/ApiCommand';
import ApiRequestInfo from 'main/api/ApiRequestInfo';
import * as http from 'http';
import * as util from 'util';
import RequestTable from 'main/RequestTable';
import ILogger, { LogLevel } from 'main/logger/ILogger';

// SPEC:
//
// requests (POST)- fetch requests from db
// params:
//  fields    - required fields in a string array
//  urlRegexp   - regexp for url to filter
//  onlyNotNull - show only when every field is not null
// response:
//  list of db objects with the requested fields

class LoadRequestsOption {
  fields?: string[];
  urlRegexp?: string;
  onlyNotNull: boolean;

  static checkType(arg: any): arg is LoadRequestsOption {
    return Array.isArray(arg.fields)
    || typeof arg.onlyNotNull === `boolean`
    || typeof arg.urlRegexp === 'string';
  }
}

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
    .then((rows: any[]) => {
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

  async loadRequests(options: LoadRequestsOption): Promise<any[]> {
    const query = this.buildRequestsQuery(options);

    this.logger.log(LogLevel.DEBUG, `query ${query}`);
    return this.requestTable.queryRequests(query);
  }

  private buildRequestsQuery(options: LoadRequestsOption) {
    // TODO: move query building in RequestTable

    let fields = '*';
    if (options.fields && options.fields.length) {
      const wrappedFields = options.fields; // options.fields.map(v => this.dbConnection.wrapString(v));
      fields = wrappedFields.join(',');
    }
    let wherePart = '';
    let urlRegexp = '';
    if (options.urlRegexp) {
      urlRegexp = options.urlRegexp;
      wherePart += `url REGEXP ${this.requestTable.wrapString(urlRegexp)}`;
    }
    if (options.onlyNotNull && options.fields) {
      for (let i = 0; i < options.fields.length; i += 1) {
        if (wherePart.length > 0) {
          wherePart += ' AND ';
        }
        wherePart += `${options.fields[i]} IS NOT NULL `;
      }
    }
    let query = `select ${fields} from main`;
    if (wherePart.length) {
      query += ` where ${wherePart}`;
    }
    query += ' order by date DESC';
    return query;
  }
}
