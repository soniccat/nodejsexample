import StubGroup from 'Data/stub/StubGroup';
import { StubGroupTable } from 'DB/StubGroupTable';

class StubHolder {
  stubGroupTable: StubGroupTable;
  stubGroups: StubGroup[] = [];

  constructor(stubGroupTable: StubGroupTable) {
    this.stubGroupTable = stubGroupTable;
  }

  async load() : Promise<null> {
    return this.stubGroupTable.loadStubGroups().then((groups: StubGroup[]) => {
      this.stubGroups = groups;
      return null;
    });
  }
}

export default StubHolder;
