import { ApiCommand, setResponse } from 'main/api/ApiCommand';
import ILogger from 'Logger/ILogger';
import ApiCommandInfo from 'main/api/ApiCommandInfo';
import * as http from 'http';
import SessionManager from 'main/session/SessionManager';
import * as util from 'util';

// SPEC:
//
// session (PATCH) - change current session
// body: according https://tools.ietf.org/html/rfc6902
//  { "op": "add", "path": "/stubGroupIds", "values": "[stubGroupId]" } // append stubGroup
//  { "op": "remove", "path": "/stubGroupIds", "values": "[stubGroupId]" } // remove stubGroup
// response:
//  SessionInfo

class ApiPatchSessionCommand implements ApiCommand {
  logger: ILogger;
  manager: SessionManager;

  constructor(manager: SessionManager, logger: ILogger) {
    this.manager = manager;
    this.logger = logger;
  }

  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    if (!Array.isArray(requestInfo.body)) {
      throw 'ApiPatchSessionCommand wrong body, array is expected';
    }

    return Promise.all(requestInfo.body.map(async (o) => {
      await this.handleOperation(o);
    })).then((o) => {
      return this.fillResponse(res);
    });
  }

  async handleOperation(o: any) {
    if (o.path === '/stubGroupIds') {
      return this.updateStubGroupIds(o);
    }

    return Promise.reject(`ApiPatchSessionCommand wrong operation ${util.inspect(o)}`);
  }

  async updateStubGroupIds(o: any) {
    const ids = o.values;
    if (!Array.isArray(ids)) {
      return Promise.reject('ApiPatchSessionCommand stubGroupIds operation values should be array ${util.inspect(o)}');
    }

    if (o.op === 'add') {
      return this.manager.start(o.values);
    }

    if (o.op === 'remove') {
      return this.manager.stop(o.values);
    }
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return requestInfo.components.length === 1 &&
    requestInfo.body !== undefined &&
    requestInfo.method === 'PATCH' &&
    requestInfo.components[0] === 'session';
  }

  async fillResponse(res: http.ServerResponse): Promise<http.ServerResponse> {
    return setResponse(res, 200, JSON.stringify(this.manager.sessionInfo()));
  }
}

export default ApiPatchSessionCommand;
