import { Request } from 'Model/Request';

class StubGroup {
  stubs: Request[];
  parent?: StubGroup;
}

export default StubGroup;
