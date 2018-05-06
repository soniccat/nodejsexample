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
    return arg.fields !== undefined && arg.onlyNotNull !== undefined;
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

  async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const apiRequestInfo = await this.extractRequestData(req);

    this.handleApiRequest(apiRequestInfo, res, () => {
      res.end();
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

  async extractApiRequestInfo(req: http.IncomingMessage) {
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

  handleApiRequest(requestInfo: ApiRequestInfo, res: http.ServerResponse, callback: () => void) {
    // allow Cross-Origin Resource Sharing preflight request
    this.logger.log(`ApiHandler handle: ${requestInfo.components.join('/')} method: ${requestInfo.method}`);

    if (requestInfo.method === 'OPTIONS') {
      this.handleOptionsRequest(res, callback);
    } else if (requestInfo.components.length > 0 && LoadRequestsOption.checkType(requestInfo.body) && requestInfo.components[0] === 'requests') {
      this.handleRequests(requestInfo.body, res, () => {
        callback();
      });
    } else if (requestInfo.components.length > 0 && requestInfo.body && requestInfo.components[0] === 'request') {
      this.handleCreateRequest(requestInfo.body, res, () => {
        callback();
      });
    } else {
      this.fillNotFoundResponse(res);
      callback();
    }
  }

  private handleOptionsRequest(res: any, callback: () => void) {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type',
    });
    callback();
  }

  private handleCreateRequest(body: object, res: http.ServerResponse, callback: () => void) {
    const obj = body as RequestRow;
    this.requestTable.writeRequestRow(obj, (writeErr) => {
      if (!writeErr) {
        this.requestTable.getLastInsertedIndex((err, rows) => {
          let code;
          let resBody;

          if (!err && rows.length && rows[0]['LAST_INSERT_ID()']) {
            const insertedId = rows[0]['LAST_INSERT_ID()'];
            resBody = JSON.stringify(Object.assign({ id: insertedId }, obj));
            code = 200;
          } else {
            code = 500;
          }

          this.setResponseHeader(res, code, resBody);
          callback();
        });
      } else {
        this.setResponseHeader(res, 500, undefined);
      }
    });
  }

  private handleRequests(body: LoadRequestsOption, res: http.ServerResponse, callback: () => void) {
    this.loadRequests(body, (err, rows) => {
      const code = err ? 500 : 200;
      const resBody = err ? undefined : JSON.stringify(rows);

      this.setResponseHeader(res, code, resBody);
      callback();
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

  private loadRequests(options: LoadRequestsOption, callback: Client.queryCallback) {
    let fields = '*';
    if (options.fields && options.fields.length) {
      const wrappedFields = options.fields;// options.fields.map(v => this.dbConnection.wrapString(v));
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

    // TODO: move query building in RequestTable
    this.logger.log(`query ${query}`);
    this.requestTable.queryRequests(query, callback);
  }
}

export default ApiHandler;
