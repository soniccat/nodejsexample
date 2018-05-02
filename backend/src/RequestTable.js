import { getUrlString } from './requesttools';

class RequestTable {
  constructor(connection) {
    this.dbConnection = connection;
  }

  writeRequestRowAsRequestInfo(requestInfo, responseInfo, callback) {
    this.writeRequestRow({
      url: getUrlString(requestInfo),
      port: requestInfo.options.port,
      method: requestInfo.options.method,
      headers: requestInfo.options.headers,
      body: requestInfo.body,
      responseStatus: responseInfo.statusCode,
      responseHeaders: responseInfo.headers,
      responseBody: responseInfo.body,
      isStub: false,
    }, callback);
  }

  writeRequestRow(obj, callback) {
    const tableName = 'main';
    const session_id = 1;

    // SQL
    let query = `INSERT INTO ${tableName} VALUES(null,
        ${session_id}, 
        NOW(), 
        ${this.wrapString(obj.url)},
        ${obj.port},
        ${this.getHttpMethodCode(obj.method)},
        ${(obj.headers ? this.wrapString(JSON.stringify(obj.headers)) : 'NULL')},`;

    let body_string = 'NULL';
    let body_string_is_json = 0;
    const body_data = 'NULL';

    if (obj.body) {
      const bodyInfo = this.getBodyInfo(obj.body);
      body_string_is_json = bodyInfo.isJson;
      body_string = bodyInfo.string;
    }

    // SQL
    query += `${body_string}, 
        ${body_string_is_json}, 
        ${body_data}, 
        ${obj.responseStatus}, 
        ${(obj.responseHeaders ? this.wrapString(JSON.stringify(obj.responseHeaders)) : 'NULL')},`;

    let response_string = 'NULL';
    let response_string_is_json = 0;
    const response_data = 'NULL';

    if (obj.responseBody) {
      const bodyInfo = this.getBodyInfo(obj.responseBody);
      response_string_is_json = bodyInfo.isJson;
      response_string = bodyInfo.string;
    }

    // SQL
    query += `${response_string}, 
        ${response_string_is_json}, 
        ${response_data},
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

      result.isJson = isString ? this.isJsonString(responseString) : true;
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

  queryRequests(query, callback) {
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
      id: request.id,
      url: request.url,
      port: parseInt(request.port),
      method: this.getHttpMethodName(request.method),
      headers: JSON.parse(request.headers),
      body,
      responseStatus: parseInt(request.response_status),
      responseHeaders: JSON.parse(request.response_headers),
      responseBody,
      isStub: request.is_stub !== 0,
    };
  }
}

export default RequestTable;
