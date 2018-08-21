import StubGroup from 'Data/stub/StubGroup';
import DbConnection from 'DB/DbConnection';

const tableName = 'stub_group';
const relationTableName = 'stub_group_requests';

/*
create table if not exists stub_group (
  id bigint unsigned auto_increment primary key,
  parent_request_id bigint unsigned not null,
  CONSTRAINT `fk_parent_request_id`
            FOREIGN KEY (parent_request_id) REFERENCES request (id)
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

class DbStubGroup {
  id: number;
}

export class StubGroupTable {
  private dbConnection: DbConnection;

  constructor(connection: DbConnection) {
    this.dbConnection = connection;
  }

  async loadStubGroups(): Promise<StubGroup[]> {
    const query = this.buildLoadQuery();
    return await this.dbConnection.queryPromise(query).
      then((stubs: StubGroup[]) => {
        return this.normalizeStubGroups(stubs);
      });
  }

  normalizeStubGroups(groups: StubGroup[]): StubGroup[] {
    const result: StubGroup[] = [];

    for (let i = 0; i < groups.length; i += 1) {
      result[i] = this.normalizeStubGroup(groups[i]);
    }

    return result;
  }

  normalizeStubGroup(stubGroup: StubGroup): StubGroup {
    return stubGroup;
  }

  private buildLoadQuery() {
    return `select ${tableName}.id as stub_group_id, ${tableName}.parent_request_id, ${relationTableName}.request_id, request.*
    from ${tableName} left outer join ${relationTableName}
        left join request on ${relationTableName}.request_id=request.id
    on ${tableName}.id=${relationTableName}.group_id;`;
  }
}
