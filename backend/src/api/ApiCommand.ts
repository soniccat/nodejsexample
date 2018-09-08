import * as http from 'http';
import ApiCommandInfo from 'main/api/ApiCommandInfo';

export interface ApiCommand {
  run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse>;
  canRun(requestInfo: ApiCommandInfo): boolean;
}

export function setResponse(res: http.ServerResponse, code: number, body?: string): http.ServerResponse {
  res.writeHead(code, Object.assign({
    'Content-Type': 'application/json',
  }, baseHead()));

  if (body) {
    res.write(body);
  }

  return res;
}

export function setNotFoundResponse(res: http.ServerResponse): http.ServerResponse {
  res.writeHead(404, baseHead());
  return res;
}

function baseHead() {
  return { 'Access-Control-Allow-Origin': '*' };
}
