import StubGroup from 'Model/StubGroup';
import { StubGroupTable } from 'DB/StubGroupTable';
import ILogger, { LogLevel } from 'Logger/ILogger';
import * as util from 'util';
import * as http from 'http';
import SendInfo from 'Data/request/SendInfo';
import Request from 'Model/Request';
import SessionInfo from 'Model/SessionInfo';
import { isObject } from 'Utils/objectTools';
import { bodyToString } from 'Utils/requesttools';

export default class SessionManager {
  logger: ILogger;
  stubGroupTable: StubGroupTable;

  stubGroups: StubGroup[] = [];

  constructor(table: StubGroupTable, logger: ILogger) {
    this.logger = logger;
    this.stubGroupTable = table;
  }

  async start(stubGroupIds: number[]) {
    const notActiveIds = stubGroupIds.filter(id => this.stubGroups.find(o => o.id === id) === undefined);
    if (notActiveIds.length) {
      return this.loadStubGroups(notActiveIds).then((groups) => {
        this.stubGroups = this.stubGroups.concat(groups);
      }).catch((e) => {
        this.logger.log(LogLevel.ERROR, `Can't start SessionManager ${util.inspect(e)}`);
      });
    }

    return Promise.resolve();
  }

  stop(stubGroupIds: number[]) {
    this.stubGroups = this.stubGroups.filter(o => stubGroupIds.find(id => id === o.id) === undefined);
  }

  isActive(): boolean {
    return this.stubGroups.length > 0;
  }

  async loadStubGroups(ids: number[]): Promise<StubGroup[]> {
    return this.stubGroupTable.loadStubGroups().then((groups: StubGroup[]) => {
      return groups.filter(group => ids.findIndex(o => o === group.id) !== -1);
    });
  }

  async process(sendInfo: SendInfo, response: http.ServerResponse): Promise<http.ServerResponse | undefined> {
    const request = this.isActive ? this.findRequest(sendInfo) : undefined;
    let result: http.ServerResponse | undefined;

    if (request != null) {
      this.fillResponseInfo(request, response);
      result = response;
    }

    return result;
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

  sessionInfo(): SessionInfo {
    return {
      stubGroupIds: this.stubGroups.map(o => o.id),
    };
  }
}
