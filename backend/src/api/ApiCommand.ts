import * as http from 'http';
import ApiCommandInfo from 'main/api/ApiCommandInfo';

export interface ApiCommand {
  run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse>;
  canRun(requestInfo: ApiCommandInfo): boolean;
}

export function setResponse(res: http.ServerResponse, code: number, body?: string): http.ServerResponse {
  res.writeHead(code, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  });

  if (body) {
    res.write(body);
  }

  return res;
}

export function setNotFoundResponse(res: http.ServerResponse): http.ServerResponse {
  res.writeHead(404);
  return res;
}
