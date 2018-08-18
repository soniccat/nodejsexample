import { getUrlString } from 'main/requesttools';
import ResponseInfo from 'main/baseTypes/ResponseInfo';
import SendInfo from 'main/baseTypes/SendInfo';
import * as Client from 'mysql';
import DbConnection from 'main/DbConnection';
import { isString } from 'main/objectTools';
import { RequestInfo } from 'main/baseTypes/RequestInfo';

const tableName = 'main';

export class RequestRow {
  id?: number;
  url: string;
  port: number;
  method: string;
  headers: {[index: string]: any};
  body: string | object | undefined;
  responseStatus: number;
  responseHeaders: {[index: string]: any};
  responseBody: string | object | undefined;
  isStub: boolean;

  static checkType(obj): obj is RequestRow {
    return typeof obj.url === `string`
    && typeof obj.port === `number`
    && typeof obj.method === `string`
    && obj.headers
    && typeof obj.responseStatus === `number`
    && obj.responseHeaders
    && typeof obj.isStub === `boolean`;
  }
}

// match SQL table row names

/* tslint:disable:variable-name */
class DbRequestRow {
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

  async writeRequestRowAsRequestInfo(requestInfo: RequestInfo): Promise<any[]> {
    return this.writeRequestRow({
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

  async writeRequestRow(obj: RequestRow): Promise<any[]> {
    const query = this.buildWriteRequestQuery(obj);
    return this.dbConnection.queryPromise(query);
  }

  async updateRequestRow(obj: RequestRow): Promise<any[]> {
    const query = this.buildUpdateRequestQuery(obj);
    return this.dbConnection.queryPromise(query);
  }

  async deleteRequestRow(id: number): Promise<any[]> {
    const query = this.buildDeleteRequestQuery(id);
    return this.dbConnection.queryPromise(query);
  }

  private buildWriteRequestQuery(obj: RequestRow) {
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

  private buildUpdateRequestQuery(obj: RequestRow) {
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

  async queryRequests(query: string): Promise<any[]> {
    const rows: DbRequestRow[] = await this.dbConnection.queryPromise(query);
    const requestRows: RequestRow[] = this.normalizeRequests(rows);

    return requestRows;
  }

  normalizeRequests(reqList: DbRequestRow[]): RequestRow[] {
    const result: RequestRow[] = [];

    for (let i = 0; i < reqList.length; i += 1) {
      result[i] = this.normalizeRequest(reqList[i]);
    }

    return result;
  }

  normalizeRequest(request: DbRequestRow): RequestRow {
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
