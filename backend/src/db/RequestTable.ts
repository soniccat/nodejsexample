import { getUrlString, isBodyJson, bodyToString } from 'Utils/requesttools';
import DbConnection from 'DB/DbConnection';
import { RequestInfo } from 'Data/request/RequestInfo';
import Request from 'Model/Request';
import { LoadRequestsOption } from 'Model/LoadRequestsOption';

const tableName = 'request';

// match SQL table row names
/*
create table if not exists request (
  id bigint unsigned auto_increment primary key,
  session_id integer unsigned not null,
  date datetime not null,
  url varchar(2048) not null,
  port smallint unsigned not null,
  method tinyint unsigned not null,
  headers json null check(headers is null or json_valid(headers)),
  body_string longtext null,
  body_string_is_json boolean,
  body_data mediumblob null,
  response_status smallint unsigned null,
  response_headers json null check(response_headers is null or json_valid(response_headers)),
  response_string longtext null,
  response_string_is_json boolean,
  response_data mediumblob null,
  is_stub boolean,
  name varchar(2048) not null,
) engine=InnoDB default charset utf8;
*/

/* tslint:disable:variable-name */
export class DbRequestRow {
  id: number = -1;
  session_id: number = -1;
  date: string = '';
  url: string = '';
  port: number = 0;
  method: number = 0;
  headers?: string;
  body_string?: string;
  body_string_is_json: boolean = false;
  body_data?: any;
  response_status: number = 0;
  response_headers?: string;
  response_string?: string;
  response_string_is_json: boolean = false;
  response_data?: any;
  is_stub: number = 0;
  name: string = '';
}
/* tslint:enable:variable-name */

class RequestTable {
  private dbConnection: DbConnection;

  constructor(connection: DbConnection) {
    this.dbConnection = connection;

    this.getLastInsertedIndex = this.getLastInsertedIndex.bind(this);
  }

  async loadRequests(options: LoadRequestsOption): Promise<Request[]> {
    const query = this.buildLoadQuery(options);
    return await this.dbConnection.queryPromise(query).
      then((requests: DbRequestRow[]) => {
        return this.normalizeRequests(requests);
      });
  }

  async writeRequestAsRequestInfo(name: string, requestInfo: RequestInfo): Promise<any[]> {
    return this.writeRequest({
      name,
      url: getUrlString(requestInfo.sendInfo),
      port: requestInfo.sendInfo.port,
      method: requestInfo.sendInfo.method,
      headers: requestInfo.sendInfo.headers,
      body: requestInfo.sendInfo.body,
      responseStatus: requestInfo.responseInfo.statusCode,
      responseHeaders: requestInfo.responseInfo.headers,
      responseBody: requestInfo.responseInfo.body,
      isStub: false});
  }

  async writeRequest(obj: Request): Promise<any[]> {
    const query = this.buildWriteRequestQuery(obj);
    return this.dbConnection.queryPromise(query);
  }

  async updateRequest(obj: Request): Promise<any[]> {
    const query = this.buildUpdateRequestQuery(obj);
    return this.dbConnection.queryPromise(query);
  }

  async deleteRequest(id: number): Promise<any[]> {
    const query = this.buildDeleteRequestQuery(id);
    return this.dbConnection.queryPromise(query);
  }

  private buildLoadQuery(options: LoadRequestsOption) {
    let wherePart = '';
    let urlRegexp = '';
    if (options.urlRegexp) {
      urlRegexp = options.urlRegexp;
      wherePart += `url REGEXP ${this.wrapString(urlRegexp)}`;
    }

    let query = `select * from ${tableName}`;
    if (wherePart.length) {
      query += ` where ${wherePart}`;
    }
    query += ' order by date DESC';
    return query;
  }

  private buildWriteRequestQuery(obj: Request) {
    const sessionId = 1;
    // SQL
    let query = `INSERT INTO ${tableName} VALUES(null,
        ${sessionId},
        NOW(),
        ${this.wrapString(obj.url)},
        ${obj.port},
        ${this.getHttpMethodCode(obj.method)},
        ${this.getSQLHeaderValue(obj.headers)},`;

    let bodyString = 'NULL';
    let bodyStringIsJson = false;
    const bodyData = 'NULL';
    if (obj.body) {
      bodyStringIsJson = isBodyJson(obj.body);
      bodyString = this.getBodyValue(obj.body);
    }
    // SQL
    query += `${bodyString},
        ${bodyStringIsJson},
        ${bodyData},
        ${obj.responseStatus},
        ${this.getSQLHeaderValue(obj.responseHeaders)},`;

    let responseString = 'NULL';
    let responseStringIsJson = false;
    const responseData = 'NULL';
    if (obj.responseBody) {
      responseStringIsJson = isBodyJson(obj.responseBody);
      responseString = this.getBodyValue(obj.responseBody);
    }
    // SQL
    query += `${responseString},
        ${responseStringIsJson},
        ${responseData},
        ${obj.isStub},
        ${this.wrapString(obj.name)}
        );`;
    return query;
  }

  private buildUpdateRequestQuery(obj: Request) {
    // SQL
    let query = `UPDATE ${tableName} SET
        url=${this.wrapString(obj.url)},
        port=${obj.port},
        method=${this.getHttpMethodCode(obj.method)},
        headers=${this.getSQLHeaderValue(obj.headers)},`;

    let bodyString = 'NULL';
    let bodyStringIsJson = false;
    const bodyData = 'NULL';
    if (obj.body) {
      bodyStringIsJson = isBodyJson(obj.body);
      bodyString = this.getBodyValue(obj.body);
    }
    // SQL
    query += `body_string=${bodyString},
        body_string_is_json=${bodyStringIsJson},
        body_data=${bodyData},
        response_status=${obj.responseStatus},
        response_headers=${this.getSQLHeaderValue(obj.responseHeaders)},`;

    let responseString = 'NULL';
    let responseStringIsJson = false;
    const responseData = 'NULL';
    if (obj.responseBody) {
      responseStringIsJson = isBodyJson(obj.responseBody);
      responseString = this.getBodyValue(obj.responseBody);
    }
    // SQL
    query += `response_string=${responseString},
        response_string_is_json=${responseStringIsJson},
        response_data=${responseData},
        is_stub=${obj.isStub},
        name=${this.wrapString(obj.name)}`;

    // WHERE
    query += ` WHERE id=${obj.id};`;
    return query;
  }

  private buildDeleteRequestQuery(id: number) {
    return `DELETE FROM ${tableName} WHERE id=${id}`;
  }

  async getLastInsertedIndex(): Promise<number> {
    let index = undefined;
    const rows = await this.dbConnection.queryPromise('SELECT LAST_INSERT_ID();');
    if (rows.length && rows[0]['LAST_INSERT_ID()']) {
      index = rows[0]['LAST_INSERT_ID()'];
    }

    if (index === undefined) {
      return Promise.reject(undefined);
    }

    return index;
  }

  getSQLHeaderValue(obj: object) {
    return (obj ? this.wrapString(JSON.stringify(obj)) : 'NULL');
  }

  getBodyValue(body: Buffer | string | object | undefined): string {
    const str = bodyToString(body);
    return str ? this.wrapString(str) : 'NULL';
  }

  wrapString(str: string) {
    return this.dbConnection.wrapString(str);
  }

  getHttpMethodCode(name: string) {
    switch (name) {
      case 'GET': return 1;
      case 'POST': return 2;
      case 'DELET': return 3;
      case 'PATCH': return 4;
      case 'OPTIONS': return 5;
      default: return 0;
    }
  }

  getHttpMethodName(code: number) {
    switch (code) {
      case 1: return 'GET';
      case 2: return 'POST';
      case 3: return 'DELETE';
      case 4: return 'PATCH';
      case 5: return 'OPTIONS';
      default: return 'UNKNOWN';
    }
  }

  normalizeRequests(reqList: DbRequestRow[]): Request[] {
    const result: Request[] = [];

    for (let i = 0; i < reqList.length; i += 1) {
      result[i] = this.normalizeRequest(reqList[i]);
    }

    return result;
  }

  normalizeRequest(request: DbRequestRow): Request {
    let body;
    if (request.body_string_is_json) {
      body = request.body_string ? JSON.parse(request.body_string) : {};
    } else if (request.body_string) {
      body = request.body_string;
    }

    let responseBody;
    if (request.response_string_is_json) {
      responseBody = request.response_string ? JSON.parse(request.response_string) : {};
    } else if (request.response_string) {
      responseBody = request.response_string;
    }

    return {
      body,
      responseBody,
      id: request.id,
      url: request.url,
      port: request.port,
      method: this.getHttpMethodName(request.method),
      headers: request.headers ? JSON.parse(request.headers) : {},
      responseStatus: request.response_status,
      responseHeaders: request.response_headers ? JSON.parse(request.response_headers) : {},
      isStub: request.is_stub !== 0,
      name: request.name,
    };
  }
}

export default RequestTable;
