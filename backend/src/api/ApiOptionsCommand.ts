import { ApiCommand } from 'main/api/ApiCommand';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';

export default class ApiOptionsCommand implements ApiCommand {
  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {

    // allow Cross-Origin Resource Sharing preflight request
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
      'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type',
    });

    return res;
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.method === 'OPTIONS';
  }
}
