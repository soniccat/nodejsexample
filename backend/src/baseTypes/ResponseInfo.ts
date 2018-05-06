import * as http from 'http';

// is used to build a db insert query
class ResponseInfo {
  headers: http.OutgoingHttpHeaders;
  statusCode: number;
  body: string | Buffer | object;          // unzipped body
  originalBody: string | Buffer | object;  // to return original gzipped body
}

export default ResponseInfo;
