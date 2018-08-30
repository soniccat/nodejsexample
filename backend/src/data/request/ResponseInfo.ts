import * as http from 'http';

class ResponseInfo {
  headers: http.OutgoingHttpHeaders;
  statusCode: number;
  body: string | Buffer | object | undefined;          // unzipped body
  originalBody: string | Buffer | object;  // to return original gzipped body
}

export default ResponseInfo;
