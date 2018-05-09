import { ApiCommand } from 'main/api/ApiCommand';
import ApiRequestInfo from 'main/api/ApiRequestInfo';
import * as http from 'http';

export default class ApiOptionsCommand implements ApiCommand {
  async run(requestInfo: ApiRequestInfo, res: http.ServerResponse): Promise<http.ServerResponse> {

    // allow Cross-Origin Resource Sharing preflight request
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type',
    });

    return res;
  }

  canRun(requestInfo: ApiRequestInfo): boolean {
    return requestInfo.method === 'OPTIONS';
  }
}
