import { Request } from './Request';

class StubGroup {
  id: number;
  name: string;
  requests: Request[];
  parent?: StubGroup;

  constructor(id: number, name: string = "") {
    this.id = id;
    this.name = name;
    this.requests = [];
  }
}

export default StubGroup;
