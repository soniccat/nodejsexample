import * as url from 'url';
import * as util from 'util';
import { readPostBodyPromise } from 'Utils/requesttools';
import ILogger, { LogLevel } from 'Logger/ILogger';
import * as http from 'http';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import { ApiCommand, setNotFoundResponse, setResponse } from 'main/api/ApiCommand';

class ApiHandler {
  apiPath: string;
  logger: ILogger;
  commands: ApiCommand[] = [];

  constructor(apiPath: string, logger: ILogger) {
    this.apiPath = apiPath;
    this.logger = logger;
  }

  setCommands(commands: ApiCommand[]) {
    this.commands = commands;
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
