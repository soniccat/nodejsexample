import * as url from 'url';
import { readPostBody, readPostBodyPromise } from 'main/requesttools';
import RequestTable from 'main/RequestTable';
import { Request } from 'Model/Request';
import DbConnection from 'main/DbConnection';
import ILogger, { LogLevel } from 'main/logger/ILogger';
import * as http from 'http';
import * as Client from 'mysql';
import ApiRequestInfo from 'main/api/ApiRequestInfo';
import { ApiCommand, setResponseHeader, setNotFoundResponse } from 'main/api/ApiCommand';
import ApiOptionsCommand from 'main/api/ApiOptionsCommand';
import ApiRequestsCommand from 'main/api/ApiRequestsCommand';
import ApiUpdateRequestCommand from 'main/api/ApiUpdateRequestCommand';
import ApiCreateRequestCommand from 'main/api/ApiCreateRequestCommand';
import ApiDeleteRequestCommand from 'main/api/ApiDeleteRequestCommand';

class ApiHandler {
  dbConnection: DbConnection;
  apiPath: string;
  logger: ILogger;
  requestTable: RequestTable;
  commands: ApiCommand[];

  constructor(dbConnection: DbConnection, apiPath: string, logger: ILogger) {
    this.dbConnection = dbConnection;
    this.apiPath = apiPath;
    this.logger = logger;
    this.requestTable = new RequestTable(this.dbConnection);

    this.commands = [
      new ApiOptionsCommand(),
      new ApiRequestsCommand(this.requestTable, logger),
      new ApiUpdateRequestCommand(this.requestTable, logger),
      new ApiCreateRequestCommand(this.requestTable, logger),
      new ApiDeleteRequestCommand(this.requestTable, logger)];
  }

  async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.extractRequestData(req)
    .then((info: ApiRequestInfo) => this.handleApiRequest(info, res))
    .then((res: http.ServerResponse) => {
      return res;
    });
  }

  async extractRequestData(req: http.IncomingMessage): Promise<ApiRequestInfo> {
    const apiRequestInfo = await this.extractApiRequestInfo(req);
    const body = await readPostBodyPromise(req);

    if (body !== undefined) {
      apiRequestInfo.body = JSON.parse(body.toString());
    }

    return apiRequestInfo;
  }

  async extractApiRequestInfo(req: http.IncomingMessage): Promise<ApiRequestInfo> {
    return new Promise<ApiRequestInfo>((resolve, request) => {
      if (req.url === undefined) {
        throw new Error('handleRequest: request without url');
      }

      if (req.method === undefined) {
        throw new Error('handleRequest: request without method');
      }

      const reqUrl = url.parse(req.url);
      const method = req.method;

      if (reqUrl.path === undefined) {
        throw new Error(`handleRequest: request without url path ${reqUrl}`);
      }

      const path = reqUrl.path.substr(this.apiPath.length + 2); // +2 for double '/' at the beginning and end
      const components = path.split('/');

      resolve({
        components,
        method,
      });
    });
  }

  async handleApiRequest(requestInfo: ApiRequestInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    this.logger.log(LogLevel.DEBUG, `ApiHandler handle: ${requestInfo.components.join('/')} method: ${requestInfo.method}`);

    for (const command of this.commands) {
      if (command.canRun(requestInfo)) {
        return command.run(requestInfo, res);
      }
    }

    setNotFoundResponse(res);
    return res;
  }
}

export default ApiHandler;
