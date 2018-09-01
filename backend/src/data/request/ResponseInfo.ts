import * as http from 'http';

class ResponseInfo {
  headers: http.OutgoingHttpHeaders = {};
  statusCode: number = 0;
  body: string | Buffer | object | undefined;          // unzipped body
  originalBody: string | Buffer | object | undefined;  // to return original gzipped body
}

export default ResponseInfo;
