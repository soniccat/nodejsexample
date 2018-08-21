import StubGroup from 'Data/stub/StubGroup';
import DbConnection from 'DB/DbConnection';
import RequestTable, { DbRequestRow } from 'DB/RequestTable';
import { Request } from 'Model/Request';

const tableName = 'stub_group';
const relationTableName = 'stub_group_requests';

/*
create table if not exists stub_group (
  id bigint unsigned auto_increment primary key,
  parent_group_id bigint unsigned,
  CONSTRAINT `fk_parent_group_id`
            FOREIGN KEY (parent_group_id) REFERENCES stub_group (id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
) engine=InnoDB default charset utf8;

create table if not exists stub_group_requests (
  id bigint unsigned auto_increment primary key,
  group_id bigint unsigned not null,
  CONSTRAINT `fk_group_id`
            FOREIGN KEY (group_id) REFERENCES stub_group (id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
  request_id bigint unsigned not null,
  CONSTRAINT `fk_request_id`
            FOREIGN KEY (request_id) REFERENCES request (id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
) engine=InnoDB default charset utf8;
*/

/* tslint:disable:variable-name */
class DbStubGroup extends DbRequestRow {
  stub_group_id: number;
  parent_group_id: number;
}
/* tslint:enable:variable-name */

export class StubGroupTable {
  private dbConnection: DbConnection;

  constructor(connection: DbConnection) {
    this.dbConnection = connection;
  }

  async loadStubGroups(): Promise<StubGroup[]> {
    const query = this.buildLoadQuery();
    return await this.dbConnection.queryPromise(query).
      then((stubs: DbStubGroup[]) => {
        return this.normalizeStubGroups(stubs);
      });
  }

  normalizeStubGroups(groups: DbStubGroup[]): StubGroup[] {
    const result: StubGroup[] = [];
    const requestTable = new RequestTable(this.dbConnection);

    for (let i = 0; i < groups.length; i += 1) {
      const dbGroup = groups[i];
      const group = this.stubGroupById(dbGroup, result);
      this.normalizeStubGroup(dbGroup, requestTable, group);
    }

    return result;
  }

  stubGroupById(dbGroup: DbStubGroup, groups: StubGroup[]): StubGroup {
    let res = groups.find((value: StubGroup, index: number, obj: StubGroup[]) => {
      return value.id === dbGroup.id;
    });

    if (res === undefined) {
      const parent = dbGroup.parent_group_id ? new StubGroup(dbGroup.parent_group_id) : undefined;
      res = new StubGroup(dbGroup.id);
    }

    return res;
  }

  normalizeStubGroup(stubGroup: DbStubGroup, requestTable: RequestTable, result: StubGroup) {
    const request = requestTable.normalizeRequest(stubGroup);

    result.
  }

  private buildLoadQuery() {
    return `select ${tableName}.id as stub_group_id,
                   ${tableName}.parent_request_id as stub_parent_request_id,
                   request.*
    from ${tableName} left outer join ${relationTableName}
        left join request
        on ${relationTableName}.request_id=request.id
    on ${tableName}.id=${relationTableName}.group_id;`;
  }
}
