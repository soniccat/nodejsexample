import * as url from 'url';
import { readPostBody } from './requesttools';
import RequestTable from './RequestTable';
import DbConnection from 'main/DbConnection';
import ILogger from 'main/logger/ILogger';

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

  handleRequest(req, res) {
    const reqUrl = url.parse(req.url);
    const path = reqUrl.path.substr(this.apiPath.length + 2); // +2 for double '/' at the beginning and end
    const components = path.split('/');

    // allow Cross-Origin Resource Sharing preflight request
    this.logger.log(`url: ${req.url} method: ${req.method}`);

    if (req.method === 'OPTIONS') {
      res.writeHeader(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type',
      });
      res.end();
    } else {
      readPostBody(req, (body) => {
        this.handleComponents(components, body, res, () => {
          res.end();
        });
      });
    }
  }

  handleComponents(components, body, res, callback) {
    if (components.length > 0 && components[0] === 'requests') {
      this.handleRequests(body, res, () => {
        callback();
      });
    } else if (components.length > 0 && components[0] === 'request') {
      this.handleCreateRequest(body, res, () => {
        callback();
      });
    } else {
      this.fillNotFoundResponse(res);
      callback();
    }
  }

  //
  handleCreateRequest(body, res, callback) {
    const obj = JSON.parse(body.toString());
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

  handleRequests(body, res, callback) {
    const options = JSON.parse(body.toString());
    this.loadRequests(options, (err, rows) => {
      const code = err ? 500 : 200;
      const resBody = err ? undefined : JSON.stringify(rows);

      this.setResponseHeader(res, code, resBody);
      callback();
    });
  }

  setResponseHeader(res, code, body) {
    res.writeHead(code, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    });

    if (body) {
      res.write(body);
    }
  }

  fillNotFoundResponse(res) {
    res.writeHead(404);
  }

  loadRequests(options, callback) {
    let fields = '*';
    if (options.fields) {
      fields = options.fields.join(',');
    }

    let wherePart = '';
    let urlRegexp = '';
    if (options.urlRegexp) {
      urlRegexp = options.urlRegexp;
      wherePart += `url REGEXP '${urlRegexp}'`;
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
