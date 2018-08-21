import { getUrlString } from 'Utils/requesttools';
import DbConnection from 'DB/DbConnection';
import { isString } from 'Utils/objectTools';
import { RequestInfo } from 'Data/request/RequestInfo';
import { Request } from 'Model/Request';
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
  is_stub boolean
) engine=InnoDB default charset utf8;
*/

/* tslint:disable:variable-name */
export class DbRequestRow {
  id: number;
  session_id: number;
  date: string;
  url: string;
  port: number;
  method: number;
  headers?: string;
  body_string?: string;
  body_string_is_json: boolean;
  body_data?: any;
  response_status: number;
  response_headers?: string;
  response_string?: string;
  response_string_is_json: boolean;
  response_data?: any;
  is_stub: number;
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

  async writeRequestAsRequestInfo(requestInfo: RequestInfo): Promise<any[]> {
    return this.writeRequest({
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
    let fields = '*';
    if (options.fields && options.fields.length) {
      const wrappedFields = options.fields; // options.fields.map(v => this.dbConnection.wrapString(v));
      fields = wrappedFields.join(',');
    }
    let wherePart = '';
    let urlRegexp = '';
    if (options.urlRegexp) {
      urlRegexp = options.urlRegexp;
      wherePart += `url REGEXP ${this.wrapString(urlRegexp)}`;
    }
    if (options.onlyNotNull && options.fields) {
      for (let i = 0; i < options.fields.length; i += 1) {
        if (wherePart.length > 0) {
          wherePart += ' AND ';
        }
        wherePart += `${options.fields[i]} IS NOT NULL `;
      }
    }
    let query = `select ${fields} from ${tableName}`;
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
      const bodyInfo = this.getBodyInfo(obj.body);
      bodyStringIsJson = bodyInfo.isJson;
      bodyString = bodyInfo.string;
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
      const bodyInfo = this.getBodyInfo(obj.responseBody);
      responseStringIsJson = bodyInfo.isJson;
      responseString = bodyInfo.string;
    }
    // SQL
    query += `${responseString},
        ${responseStringIsJson},
        ${responseData},
        ${obj.isStub}
        );`;
    return query;
  }

  private buildUpdateRequestQuery(obj: Request) {
    const sessionId = 1;
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
      const bodyInfo = this.getBodyInfo(obj.body);
      bodyStringIsJson = bodyInfo.isJson;
      bodyString = bodyInfo.string;
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
      const bodyInfo = this.getBodyInfo(obj.responseBody);
      responseStringIsJson = bodyInfo.isJson;
      responseString = bodyInfo.string;
    }
    // SQL
    query += `response_string=${responseString},
        response_string_is_json=${responseStringIsJson},
        response_data=${responseData},
        is_stub=${obj.isStub}`;

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

  getBodyInfo(body: string | object) {
    const result = {
      isJson: false,
      string: 'NULL',
    };

    const isBufferResponse = body instanceof Buffer;
    if (isBufferResponse) {
      // TODO: find a better way to work with string buffer
      const buffer: Buffer = body as Buffer;
      const isResponseBodyString = isBufferResponse && this.isValidUTF8Buffer(buffer);
      if (isResponseBodyString) {
        const responseString = buffer.toString();

        result.isJson = this.isJsonString(responseString);
        result.string = this.wrapString(responseString);
      } else {
        // TODO: need to support blobs
        // response_data = body;
      }
    } else {
      const isStr = isString(body);

      result.isJson = isStr ? this.isJsonString(body as string) : true;
      result.string = isStr ? body as string : this.wrapString(JSON.stringify(body));
    }

    return result;
  }

  wrapString(str: string) {
    return this.dbConnection.wrapString(str);
  }

  isValidUTF8Buffer(buf: Buffer) {
    return Buffer.compare(new Buffer(buf.toString(), 'utf8'), buf) === 0;
  }

  isJsonString(str: string) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  getHttpMethodCode(name: string) {
    switch (name) {
      case 'GET': return 1;
      case 'POST': return 2;
      default: return 0;
    }
  }

  getHttpMethodName(code: number) {
    switch (code) {
      case 1: return 'GET';
      case 2: return 'POST';
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
    };
  }
}

export default RequestTable;
