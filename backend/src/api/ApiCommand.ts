import * as http from 'http';
import ApiRequestInfo from 'main/api/ApiRequestInfo';

export interface ApiCommand {
  run(requestInfo: ApiRequestInfo, res: http.ServerResponse): Promise<http.ServerResponse>;
  canRun(requestInfo: ApiRequestInfo): boolean;
}

export function setResponseHeader(res: http.ServerResponse, code: number, body?: string) {
  res.writeHead(code, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  });

  if (body) {
    res.write(body);
  }
}

export function setNotFoundResponse(res) {
  res.writeHead(404);
}
