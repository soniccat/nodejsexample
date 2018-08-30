import StubGroup from 'Model/StubGroup';
import { StubGroupTable } from 'DB/StubGroupTable';
import ILogger, { LogLevel } from 'Logger/ILogger';
import * as util from 'util';

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

  process() {

  }
}
