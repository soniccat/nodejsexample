import * as url from 'url';
import { readPostBody, readPostBodyPromise } from './requesttools';
import RequestTable, { RequestRow } from './RequestTable';
import DbConnection from 'main/DbConnection';
import ILogger from 'main/logger/ILogger';
import * as http from 'http';
import * as Client from 'mysql';

// spec:
//
// requests (POST)- fetch requests from db
// params:
//  fields    - required fields in a string array
//  urlRegexp   - regexp for url to filter
//  onlyNotNull - show only when every field is not null
// response:
//  list of db objects with the requested fields
//
// request  (POST)- create request
// params:
//  json representation of an object

class LoadRequestsOption {
  fields: string[];
  urlRegexp?: string;
  onlyNotNull: boolean;

  static checkType(arg: any): arg is LoadRequestsOption {
    return Array.isArray(arg.fields) && typeof arg.onlyNotNull === `boolean`;
  }
}

class ApiRequestInfo {
  components: string[];
  method: string;
  body?: object;
}

class ApiHandler {
  dbConnection: DbConnection;
  apiPath: string;
  logger: ILogger;
  requestTable: RequestTable;

  constructor(dbConnection: DbConnection, apiPath: string, logger: ILogger) {
    this.dbConnection = dbConnection;
    this.apiPath = apiPath;
    this.logger = logger;
    this.requestTable = new RequestTable(this.dbConnection);
  }

  async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.extractRequestData(req)
    .then((info: ApiRequestInfo) => this.handleApiRequest(info, res))
    .then((res: http.ServerResponse) => {
      return res;
    });
  }

  async extractRequestData(req: http.IncomingMessage): Promise<ApiRequestInfo> {
    const apiRequestInfo = await this.extractApiRequestInfo(req);
    const body = await readPostBodyPromise(req);

    if (body !== undefined) {
      apiRequestInfo.body = JSON.parse(body.toString());
    }

    return apiRequestInfo;
  }

  async extractApiRequestInfo(req: http.IncomingMessage): Promise<ApiRequestInfo> {
    return new Promise<ApiRequestInfo>((resolve, request) => {
      if (req.url === undefined) {
        throw new Error('handleRequest: request without url');
      }
  
      if (req.method === undefined) {
        throw new Error('handleRequest: request without method');
      }
  
      const reqUrl = url.parse(req.url);
      const method = req.method;
  
      if (reqUrl.path === undefined) {
        throw new Error(`handleRequest: request without url path ${reqUrl}`);
      }
  
      const path = reqUrl.path.substr(this.apiPath.length + 2); // +2 for double '/' at the beginning and end
      const components = path.split('/');

      resolve({
        components,
        method,
      });
    });
  }

  async handleApiRequest(requestInfo: ApiRequestInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    // allow Cross-Origin Resource Sharing preflight request
    this.logger.log(`ApiHandler handle: ${requestInfo.components.join('/')} method: ${requestInfo.method}`);

    if (requestInfo.method === 'OPTIONS') {
      this.handleOptionsRequest(res);
    } else if (requestInfo.components.length > 0 && requestInfo.components[0] === 'requests') {
      if (LoadRequestsOption.checkType(requestInfo.body)) {
        await this.handleRequests(requestInfo.body, res);
      } else {
        this.setResponseHeader(res, 400, `Body is incorrect`);
      }
    } else if (requestInfo.components.length > 0 && requestInfo.body && requestInfo.components[0] === 'request') {
      if (RequestRow.checkType(requestInfo.body)) {
        await this.handleCreateRequest(requestInfo.body, res);
      } else {
        this.setResponseHeader(res, 400, `Body is incorrect`);
      }
    } else {
      this.fillNotFoundResponse(res);
    }

    return res;
  }

  private handleOptionsRequest(res: any) {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type',
    });
  }

  async handleCreateRequest(requestRow: RequestRow, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.requestTable.writeRequestRow(requestRow)
    .then(this.requestTable.getLastInsertedIndex.bind(this))
    .then((insertedId) => {
      const resBody = JSON.stringify(Object.assign({ id: insertedId }, requestRow));
      this.setResponseHeader(res, 200, resBody);
    })
    .catch((err) => {
      this.setResponseHeader(res, 500);
    })
    .then(() => {
      return res;
    });
  }

  async handleRequests(body: LoadRequestsOption, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.loadRequests(body)
    .then((rows: any[]) => {
      this.setResponseHeader(res, 200, JSON.stringify(rows));
    })
    .catch((err) => {
      this.setResponseHeader(res, 500);
    })
    .then(() => {
      return res;
    });
  }

  private setResponseHeader(res: http.ServerResponse, code: number, body?: string) {
    res.writeHead(code, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    });

    if (body) {
      res.write(body);
    }
  }

  private fillNotFoundResponse(res) {
    res.writeHead(404);
  }

  async loadRequests(options: LoadRequestsOption): Promise<any[]> {
    const query = this.buildRequestsQuery(options);

    this.logger.log(`query ${query}`);
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
      wherePart += `url REGEXP ${this.dbConnection.wrapString(urlRegexp)}`;
    }
    if (options.onlyNotNull && options.fields) {
      for (let i = 0; i < options.fields.length; i++) {
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

export default ApiHandler;
