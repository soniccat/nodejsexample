import { Request } from 'Model/Request';

class StubGroup {
  id: number;
  requests: Request[];
  parent?: StubGroup;

  constructor(id: number) {
    this.id = id;
    this.requests = [];
  }
}

export default StubGroup;
