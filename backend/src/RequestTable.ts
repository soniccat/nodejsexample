import { getUrlString } from 'main/requesttools';
import ResponseInfo from 'main/baseTypes/ResponseInfo';
import SendInfo from 'main/baseTypes/SendInfo';
import * as Client from 'mysql';
import DbConnection from 'main/DbConnection';

class RequestRow {
  url: string;
  port: number | string;
  method: string;
  headers: {[index: string]: any};
  body: string | object;
  responseStatus: number;
  responseHeaders: {[index: string]: any};
  responseBody: string | object;
  isStub: boolean;
}

class RequestTable {
  dbConnection: DbConnection;

  constructor(connection: DbConnection) {
    this.dbConnection = connection;
  }

  writeRequestRowAsRequestInfo(requestInfo: SendInfo, responseInfo: ResponseInfo, callback: Client.queryCallback) {
    this.writeRequestRow({
      url: getUrlString(requestInfo),
      port: requestInfo.options.port,
      method: requestInfo.options.method,
      headers: requestInfo.options.headers,
      body: requestInfo.body,
      responseStatus: responseInfo.statusCode,
      responseHeaders: responseInfo.headers,
      responseBody: responseInfo.body,
      isStub: false}, 
      callback);
  }

  writeRequestRow(obj: RequestRow, callback: Client.queryCallback) {
    const tableName = 'main';
    const sessionId = 1;

    // SQL
    let query = `INSERT INTO ${tableName} VALUES(null,
        ${sessionId}, 
        NOW(), 
        ${this.wrapString(obj.url)},
        ${obj.port},
        ${this.getHttpMethodCode(obj.method)},
        ${(obj.headers ? this.wrapString(JSON.stringify(obj.headers)) : 'NULL')},`;

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
        ${(obj.responseHeaders ? this.wrapString(JSON.stringify(obj.responseHeaders)) : 'NULL')},`;

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

    this.dbConnection.query(query, callback);
  }

  getLastInsertedIndex(callback) {
    this.dbConnection.query('SELECT LAST_INSERT_ID();', callback);
  }

  getBodyInfo(body) {
    const result = {
      isJson: false,
      string: 'NULL',
    };

    const isBufferResponse = body instanceof Buffer;
    if (isBufferResponse) {
      const isResponseBodyString = isBufferResponse && this.isValidUTF8Buffer(body);
      if (isResponseBodyString) {
        const responseString = body.toString();

        result.isJson = this.isJsonString(responseString);
        result.string = this.wrapString(responseString);
      } else {
        // TODO: need to support blobs
        // response_data = body;
      }
    } else {
      const isString = typeof body === 'string';

      result.isJson = isString ? this.isJsonString(body) : true;
      result.string = isString ? body : this.wrapString(JSON.stringify(body));
    }

    return result;
  }

  wrapString(str) {
    return this.dbConnection.wrapString(str);
  }

  isValidUTF8Buffer(buf) {
    return Buffer.compare(new Buffer(buf.toString(), 'utf8'), buf) === 0;
  }

  isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  getHttpMethodCode(name) {
    switch (name) {
      case 'GET': return 1;
      case 'POST': return 2;
      default: return 0;
    }
  }

  getHttpMethodName(code) {
    switch (code) {
      case 1: return 'GET';
      case 2: return 'POST';
      default: return 'UNKNOWN';
    }
  }

  queryRequests(query, callback: Client.queryCallback) {
    this.dbConnection.query(query, (err, rows) => {
      if (rows) {
        this.normalizeRequests(rows);
      }

      if (callback) {
        callback(err, rows);
      }
    });
  }

  normalizeRequests(reqList) {
    for (let i = 0; i < reqList.length; ++i) {
      reqList[i] = this.normalizeRequest(reqList[i]);
    }
  }

  normalizeRequest(request) {
    let body;
    if (request.body_string_is_json) {
      body = JSON.parse(request.body_string);
    } else if (request.body_string) {
      body = request.body_string;
    }

    let responseBody;
    if (request.response_string_is_json) {
      responseBody = JSON.parse(request.response_string);
    } else if (request.response_string) {
      responseBody = request.response_string;
    }

    return {
      body,
      responseBody,
      id: request.id,
      url: request.url,
      port: parseInt(request.port, 10),
      method: this.getHttpMethodName(request.method),
      headers: JSON.parse(request.headers),
      responseStatus: parseInt(request.response_status, 10),
      responseHeaders: JSON.parse(request.response_headers),
      isStub: request.is_stub !== 0,
    };
  }
}

export default RequestTable;
