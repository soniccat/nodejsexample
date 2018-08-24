import StubGroup from 'Model/StubGroup';
import Request from 'Model/Request';

export default class DataHolder {
  requests: Request[];
  stubGroups: StubGroup[];

  setRequests(requests: Request[]) {
    this.requests = requests;
  }

  setStubGroups(stubGroups: StubGroup[]) {
    this.stubGroups = stubGroups;
  }
}
