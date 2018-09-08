import * as url from 'url';
import * as util from 'util';
import { readPostBodyPromise } from 'Utils/requesttools';
import RequestTable from 'DB/RequestTable';
import DbConnection from 'DB/DbConnection';
import ILogger, { LogLevel } from 'Logger/ILogger';
import * as http from 'http';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import { ApiCommand, setNotFoundResponse, setResponse } from 'main/api/ApiCommand';
import ApiOptionsCommand from 'main/api/ApiOptionsCommand';
import ApiRequestsCommand from 'main/api/ApiRequestsCommand';
import ApiUpdateRequestCommand from 'main/api/ApiUpdateRequestCommand';
import ApiCreateRequestCommand from 'main/api/ApiCreateRequestCommand';
import ApiDeleteRequestCommand from 'main/api/ApiDeleteRequestCommand';
import { StubGroupTable } from 'DB/StubGroupTable';
import ApiStubGroupsCommand from 'main/api/ApiStubGroupsCommand';
import ApiAddRequestInStubGroupCommand from 'main/api/ApiAddRequestInStubGroupCommand';
import ApiDeleteRequestInStubGroupCommand from 'main/api/ApiDeleteRequestInStubGroupCommand';
import ApiCreateStubGroupCommand from 'main/api/ApiCreateStubGroupCommand';
import ApiDeleteStubGroupCommand from 'main/api/ApiDeleteStubGroupCommand';
import ApiSessionCommand from 'main/api/ApiSessionCommand';
import SessionManager from 'main/session/SessionManager';
import ApiPatchSessionCommand from 'main/api/ApiPatchSessionCommand';

class ApiHandler {
  dbConnection: DbConnection;
  apiPath: string;
  logger: ILogger;
  requestTable: RequestTable;
  stubGroupsTable: StubGroupTable;
  sessionManager: SessionManager;
  commands: ApiCommand[];

  constructor(dbConnection: DbConnection, sessionManager: SessionManager, apiPath: string, logger: ILogger) {
    this.dbConnection = dbConnection;
    this.apiPath = apiPath;
    this.logger = logger;
    this.requestTable = new RequestTable(this.dbConnection);
    this.stubGroupsTable = new StubGroupTable(this.dbConnection);
    this.sessionManager = sessionManager;

    this.commands = [
      new ApiOptionsCommand(),

      new ApiRequestsCommand(this.requestTable, logger),
      new ApiUpdateRequestCommand(this.requestTable, logger),
      new ApiCreateRequestCommand(this.requestTable, logger),
      new ApiDeleteRequestCommand(this.requestTable, logger),

      new ApiStubGroupsCommand(this.stubGroupsTable, logger),
      new ApiAddRequestInStubGroupCommand(this.stubGroupsTable, logger),
      new ApiDeleteRequestInStubGroupCommand(this.stubGroupsTable, logger),
      new ApiCreateStubGroupCommand(this.stubGroupsTable, logger),
      new ApiDeleteStubGroupCommand(this.stubGroupsTable, logger),

      new ApiSessionCommand(this.sessionManager, logger),
      new ApiPatchSessionCommand(this.sessionManager, logger),
    ];
  }

  async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.extractRequestData(req)
    .then((info: ApiCommandInfo) => this.handleApiRequest(info, res))
    .then((res: http.ServerResponse) => {
      return res;
    });
  }

  async extractRequestData(req: http.IncomingMessage): Promise<ApiCommandInfo> {
    const apiRequestInfo = await this.extractApiCommandInfo(req);
    const body = await readPostBodyPromise(req);

    if (body != null) {
      apiRequestInfo.body = body;
    }

    return apiRequestInfo;
  }

  async extractApiCommandInfo(req: http.IncomingMessage): Promise<ApiCommandInfo> {
    return new Promise<ApiCommandInfo>((resolve, reject) => {
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

  async handleApiRequest(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    this.logger.log(LogLevel.DEBUG, `ApiHandler handle: ${requestInfo.components.join('/')} method: ${requestInfo.method}`);

    for (const command of this.commands) {
      if (command.canRun(requestInfo)) {
        return command.run(requestInfo, res).catch((err) => {
          this.logger.log(LogLevel.ERROR, `${command.constructor.name}.run error: ${util.inspect(err)}`);
          setResponse(res, 500);
        }).then(_ => res);
      }
    }

    this.logger.log(LogLevel.DEBUG, `ApiHandler handle: not found command for ${util.inspect(requestInfo)}`);
    setNotFoundResponse(res);
    return res;
  }
}

export default ApiHandler;
