import ApiHandler from 'main/api/ApiHandler';
import DbConnection from 'DB/DbConnection';
import SessionManager from 'main/session/SessionManager';
import RequestTable from 'DB/RequestTable';
import StubGroupTable from 'DB/StubGroupTable';
import ILogger from 'Logger/ILogger';

// Commands
import ApiOptionsCommand from 'main/api/ApiOptionsCommand';
import ApiRequestsCommand from 'main/api/ApiRequestsCommand';
import ApiUpdateRequestCommand from 'main/api/ApiUpdateRequestCommand';
import ApiCreateRequestCommand from 'main/api/ApiCreateRequestCommand';
import ApiDeleteRequestCommand from 'main/api/ApiDeleteRequestCommand';
import ApiStubGroupsCommand from 'main/api/ApiStubGroupsCommand';
import ApiAddRequestInStubGroupCommand from 'main/api/ApiAddRequestInStubGroupCommand';
import ApiDeleteRequestInStubGroupCommand from 'main/api/ApiDeleteRequestInStubGroupCommand';
import ApiCreateStubGroupCommand from 'main/api/ApiCreateStubGroupCommand';
import ApiDeleteStubGroupCommand from 'main/api/ApiDeleteStubGroupCommand';
import ApiSessionCommand from 'main/api/ApiSessionCommand';
import ApiPatchSessionCommand from 'main/api/ApiPatchSessionCommand';
import ApiUpdateStubGroupCommand from 'main/api/ApiUpdateStubGroupCommand';
import ApiCommandWrapper from 'main/api/ApiCommandWrapper';
import { ApiCommand } from './ApiCommand';

export default class ApiHandlerBuilder {
  dbConnection: DbConnection;
  sessionManager: SessionManager;

  constructor(dbConnection: DbConnection, sessionManager: SessionManager) {
    this.dbConnection = dbConnection;
    this.sessionManager = sessionManager;
  }

  build(apiPath: string, logger: ILogger): ApiHandler {
    const handler = new ApiHandler(apiPath, logger);

    const requestTable = new RequestTable(this.dbConnection);
    const stubGroupsTable = new StubGroupTable(this.dbConnection);

    const commands = [
      new ApiOptionsCommand(),

      new ApiRequestsCommand(requestTable, logger),
      this.triggerOnRequestChanged(new ApiUpdateRequestCommand(requestTable, logger)),
      this.triggerOnRequestChanged(new ApiCreateRequestCommand(requestTable, logger)),
      this.triggerOnRequestChanged(new ApiDeleteRequestCommand(requestTable, logger)),

      new ApiStubGroupsCommand(stubGroupsTable, logger),
      this.triggerOnRequestChanged(new ApiAddRequestInStubGroupCommand(stubGroupsTable, logger)),
      this.triggerOnRequestChanged(new ApiDeleteRequestInStubGroupCommand(stubGroupsTable, logger)),
      new ApiCreateStubGroupCommand(stubGroupsTable, logger),
      new ApiDeleteStubGroupCommand(stubGroupsTable, logger),
      new ApiUpdateStubGroupCommand(stubGroupsTable, logger),

      new ApiSessionCommand(this.sessionManager, logger),
      new ApiPatchSessionCommand(this.sessionManager, logger),
    ];

    handler.setCommands(commands);
    return handler;
  }

  private triggerOnRequestChanged(command: ApiCommand) {
    return new ApiCommandWrapper(command, (o) => { this.onRequestChanged(); return o; });
  }

  private onRequestChanged() {
    this.sessionManager.restart();
  }
}
