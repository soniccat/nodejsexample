import StubGroup from 'Model/StubGroup';
import { StubGroupTable } from 'DB/StubGroupTable';
import ILogger, { LogLevel } from 'Logger/ILogger';
import * as util from 'util';
import * as http from 'http';
import SendInfo, { extractSendInfo, SendInfoBuilder } from 'Data/request/SendInfo';
import ResponseInfo from 'Data/request/ResponseInfo';
import Request from 'Model/Request';
import { isObject } from 'Utils/objectTools';
import { bodyToString } from 'Utils/requesttools';

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

  async process(sendInfo: SendInfo, response: http.ServerResponse): Promise<http.ServerResponse> {
    const request = this.findRequest(sendInfo);

    if (request != null) {
      this.fillResponseInfo(request, response);
      return response;
    }

    throw 'Can\'t process ${request}';
  }

  findRequest(sendInfo: SendInfo): Request | undefined {
    let request: Request | undefined;

    this.stubGroups.find((group) => {
      request = this.tryMatchStubGroup(sendInfo, group);
      return request !== undefined;
    });

    return request;
  }

  tryMatchStubGroup(sendInfo: SendInfo, group: StubGroup): Request | undefined {
    return group.requests.find(request => this.tryMatchRequest(sendInfo, request));
  }

  tryMatchRequest(sendInfo: SendInfo, request: Request): boolean {
    return this.tryMatchObjects(sendInfo.headers, request.headers) && this.tryMatchObjects(sendInfo.body, request.body);
  }

  tryMatchObjects(src: any, pattern: any): boolean {
    const isSrcObject = isObject(src);
    const isPatternObject = isObject(pattern);

    if (isSrcObject && isPatternObject) {
      const notMatchedKey = Object.keys(pattern).find((key) => {
        //const hasKey = Object.keys(src).find(k => k === key);
        const srcValue = src[key];
        const patternValue = pattern[key];

        return this.tryMatchObjects(srcValue, patternValue) === false;
      });
      return notMatchedKey === undefined;
    }

    if (!isSrcObject && !isPatternObject) {
      return this.tryMatchValues(src, pattern);
    }

    return false;
  }

  tryMatchValues(src: object, pattern: object): boolean {
    return src == pattern;
  }

  fillResponseInfo(request: Request, response: http.ServerResponse) {
    response.writeHead(request.responseStatus, request.responseHeaders);
    if (request.body) {
      response.write(bodyToString(request.responseBody));
    }
  }
}
