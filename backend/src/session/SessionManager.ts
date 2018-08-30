import StubGroup from 'Model/StubGroup';
import { StubGroupTable } from 'DB/StubGroupTable';
import ILogger, { LogLevel } from 'Logger/ILogger';
import * as util from 'util';
import * as http from 'http';
import SendInfo, { extractSendInfo } from 'Data/request/SendInfo';
import ResponseInfo from 'Data/request/ResponseInfo';
import Request from 'Model/Request';

export default class SessionManager {
  logger: ILogger;
  stubGroupTable: StubGroupTable;

  stubGroups: StubGroup[];
  isActive: boolean;

  constructor(table: StubGroupTable, logger: ILogger) {
    this.logger = logger;
    this.stubGroupTable = table;
  }

  async start(stubGroupIds: number[]) {
    if (!this.isActive) {
      this.isActive = true;

      this.loadStubGroups(stubGroupIds).then((groups) => {
        this.stubGroups = groups;
      }).catch((e) => {
        this.logger.log(LogLevel.ERROR, `Can't start SessionManager ${util.inspect(e)}`);
        this.isActive = false;
      });
    } else {
      this.logger.log(LogLevel.WARNING, `SessionManager is already started`);
    }
  }

  stop() {
    this.isActive = false;
  }

  async loadStubGroups(ids: number[]): Promise<StubGroup[]> {
    return this.stubGroupTable.loadStubGroups().then((groups: StubGroup[]) => {
      return groups.filter(group => ids.findIndex(o => o === group.id) !== -1);
    });
  }

  async process(request: http.IncomingMessage): Promise<ResponseInfo> {
    const sendInfo = await extractSendInfo(request);
    const response = this.findResponse(sendInfo);

    if (response != null) {
      return response;
    }

    throw 'Can\'t process ${request}';
  }

  findResponse(sendInfo: SendInfo): ResponseInfo | undefined {
    let request: Request | undefined;

    this.stubGroups.find((group) => {
      request = this.tryMatchStubGroup(sendInfo, group);
      return request !== undefined;
    });

    return request != null ? this.buildResponseInfo(request) : undefined;
  }

  tryMatchStubGroup(sendInfo: SendInfo, group: StubGroup): Request | undefined {
    return group.requests.find(request => this.tryMatchRequest(sendInfo, request));
  }

  tryMatchRequest(sendInfo: SendInfo, request: Request): boolean {
    return false;
  }

  buildResponseInfo(request: Request): ResponseInfo {
    return {
      headers: request.headers,
      statusCode: request.responseStatus,
      body: request.body,
      originalBody: undefined,
    };
  }
}
