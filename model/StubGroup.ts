import Request from './Request';

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

  static checkType(obj: any): obj is StubGroup {
    return typeof obj.id === `number`
    && typeof obj.name === `string`;
  }
}

export default StubGroup;
