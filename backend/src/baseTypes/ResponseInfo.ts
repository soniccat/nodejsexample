import * as http from 'http';

// is used to build a db insert query
class ResponseInfo {
  headers: http.OutgoingHttpHeaders;
  statusCode: number;
  body: string | object;          // unzipped body
  originalBody: string | object;  // to return original gzipped body
}

export default ResponseInfo;
