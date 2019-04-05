import { ApiCommand } from 'main/api/ApiCommand';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';

export default class ApiOptionsCommand implements ApiCommand {
  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {

    // allow Cross-Origin Resource Sharing preflight request
    res.writeHead(200, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, GET, OPTIONS, DELETE, PATCH',
      'access-control-allow-headers': '*',//'X-PINGOTHER, Content-Type',
    });

    return res;
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.method === 'OPTIONS';
  }
}
