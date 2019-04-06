import * as http from 'http';
import { ApiCommand } from 'main/api/ApiCommand';
import ApiCommandInfo from 'main/api/ApiCommandInfo';

export default class ApiCommandWrapper implements ApiCommand {
  command: ApiCommand;
  successBlock: (response: http.ServerResponse) => http.ServerResponse;

  constructor(command: ApiCommand, successBlock: (response: http.ServerResponse) => http.ServerResponse) {
    this.command = command;
    this.successBlock = successBlock;
  }

  async run(requestInfo: ApiCommandInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
    return this.command.run(requestInfo, res).then(this.successBlock);
  }

  canRun(requestInfo: ApiCommandInfo): boolean {
    return this.command.canRun(requestInfo);
  }
}
