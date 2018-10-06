import StubGroup from 'Model/StubGroup';
import DbConnection from 'DB/DbConnection';
import RequestTable, { DbRequestRow } from 'DB/RequestTable';

const tableName = 'stub_group';
const relationTableName = 'stub_group_requests';

/*
create table if not exists stub_group (
  id bigint unsigned auto_increment primary key,
  name varchar(2048) not null,
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
  stub_group_id: number = -1;
  stub_name: string = '';
  stub_parent_group_id: number = -1;
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
        return this.fillParentGroups(this.normalizeStubGroups(stubs));
      });
  }

  async addRequest(stubId: number, requestId: number): Promise<any[]> {
    const query = `insert into ${relationTableName} values(null, ${stubId}, ${requestId})`;
    return await this.dbConnection.queryPromise(query);
  }

  async deleteRequest(stubId: number, requestId: number): Promise<any[]> {
    const query = `delete from ${relationTableName} where group_id=${stubId} and request_id=${requestId}`;
    return await this.dbConnection.queryPromise(query);
  }

  async createStubGroup(name: string): Promise<StubGroup> {
    const dbName = this.dbConnection.wrapString(name);
    return this.dbConnection.queryPromise(`insert into ${tableName} values(null, ${dbName}, null)`)
    .then((obj) => {
      return this.dbConnection.queryPromise(`select id as stub_group_id, name as stub_name, parent_group_id as stub_parent_group_id from ${tableName} where id=LAST_INSERT_ID()`);
    }).then((rows) => {
      return this.createStubGroupObj(rows[0]);
    });
  }

  async deleteStubGroup(id: number): Promise<any> {
    return this.dbConnection.queryPromise(`delete from ${tableName} where id=${id}`);
  }

  async updateStubGroup(group: StubGroup): Promise<any[]> {
    const parentId = group.parent ? `${group.parent.id}` : 'NULL';
    const query = `UPDATE ${tableName} SET
      name=${this.dbConnection.wrapString(group.name)},
      parent_group_id=${parentId}
      WHERE id=${group.id};`;

    return this.dbConnection.queryPromise(query);
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

  fillParentGroups(groups: StubGroup[]): StubGroup[] {
    groups.forEach((value: StubGroup, index: number, array: StubGroup[]) => {
      const parentGroup = value.parent != null ? this.findGroupById(value.parent.id, groups) : undefined;
      value.parent = parentGroup;
    });

    return groups;
  }

  stubGroupById(dbGroup: DbStubGroup, groups: StubGroup[]): StubGroup {
    let res = this.findGroupById(dbGroup.stub_group_id, groups);
    if (res === undefined) {
      const parent = dbGroup.stub_parent_group_id ? new StubGroup(dbGroup.stub_parent_group_id) : undefined;
      res = this.createStubGroupObj(dbGroup);
      res.parent = parent;
      groups.push(res);
    }

    return res;
  }

  createStubGroupObj(dbGroup: DbStubGroup) {
    return new StubGroup(dbGroup.stub_group_id, dbGroup.stub_name);
  }

  findGroupById(id: number, groups: StubGroup[]): StubGroup | undefined {
    return groups.find((value: StubGroup, index: number, obj: StubGroup[]) => {
      return value.id === id;
    });
  }

  normalizeStubGroup(stubGroup: DbStubGroup, requestTable: RequestTable, result: StubGroup) {
    const request = requestTable.normalizeRequest(stubGroup);
    if (request.id != null) {
      result.requests.push(request);
    }
  }

  private buildLoadQuery() {
    return `select ${tableName}.id as stub_group_id,
                   ${tableName}.name as stub_name,
                   ${tableName}.parent_group_id as stub_parent_group_id,
                   request.*
    from ${tableName} left join ${relationTableName}
        left join request
        on ${relationTableName}.request_id=request.id
    on ${tableName}.id=${relationTableName}.group_id;`;
  }
}

export default StubGroupTable;
