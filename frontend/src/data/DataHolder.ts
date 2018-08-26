import StubGroup from 'Model/StubGroup';
import Request from 'Model/Request';
import { buildRequestsCall, buildCreateRequestCall, buildUpdateRequestCall, buildDeleteRequestCall } from 'Utils/RequestCalls';
import { buildStubGroupsCall } from 'Utils/StubGroupCalls';
import loadCommand from 'Utils/loadCommand';
import { LoadRequestsOption } from 'Model/LoadRequestsOption';

type TypeWithId = { id?: number };

export default class DataHolder {
  requests?: Request[]; // for RequestViewer
  requestsError?: Error;
  loadingRequestOptions: LoadRequestsOption;
  updatingReuests: {[id: number] : Request} = {};

  stubGroups?: StubGroup[]; // StubGroupViewer
  stubGroupsError?: Error;

  // setters

  private setStubGroups(stubGroups: StubGroup[]) {
    this.stubGroups = stubGroups;
    this.syncWithStubGroups();
    this.onDataUpdated();
  }

  private setStubGroupsError(error: Error) {
    this.stubGroupsError = error;
    this.onDataUpdated();
  }

  private setRequests(requests: Request[]) {
    this.requests = requests;
    this.syncWithRequests();
    this.onDataUpdated();
  }

  private setRequestsError(error: Error) {
    this.requestsError = error;
    this.onDataUpdated();
  }

  onDataUpdated() {
  }

  // return an old value
  private setRequest(request: Request): Request {
    const oldRequest = this.updateInList(request, this.requests);
    this.syncWithRequest(request);
    this.onDataUpdated();
    return oldRequest;
  }

  // Data synching

  private syncWithRequests() {
    // build a temporary map
    const requestMap: {[id: number] : Request} = {};
    const requests = this.requests !== undefined ? this.requests : [];
    requests.forEach((request: Request, index: number, array: Request[]) => {
      requestMap[request.id] = request;
    });

    // update requests in stubGroups
    const goups = this.stubGroups !== undefined ? this.stubGroups : [];
    goups.forEach((group: StubGroup, index: number, array: StubGroup[]) => {
      group.requests.forEach((request: Request, index: number, array: Request[]) => {
        if (requestMap[request.id]) {
          array[index] = requestMap[request.id];
        }
      });
    });
  }

  private syncWithRequest(updatedRequest: Request) {
    const requests = this.requests !== undefined ? this.requests : [];
    this.updateInList(updatedRequest, requests);

    const goups = this.stubGroups !== undefined ? this.stubGroups : [];
    goups.forEach((group: StubGroup, index: number, array: StubGroup[]) => {
      this.updateInList(updatedRequest, group.requests);
    });
  }

  private syncWithStubGroups() {
    // build a temporary map
    const requestMap: {[id: number] : Request} = {};
    const goups = this.stubGroups !== undefined ? this.stubGroups : [];
    goups.forEach((group: StubGroup, index: number, array: StubGroup[]) => {
      group.requests.forEach((request: Request, index: number, array: Request[]) => {
        requestMap[request.id] = request;
      });
    });

    // update requests
    const requests = this.requests !== undefined ? this.requests : [];
    requests.forEach((request: Request, index: number, array: Request[]) => {
      if (requestMap[request.id]) {
        array[index] = requestMap[request.id];
      }
    });
  }

  private updateInList<T extends TypeWithId>(updatedValue: T, list: T[]): T | undefined {
    let oldValue: T | undefined;
    list.forEach((value: T, index: number, array: T[]) => {
      if (value.id === updatedValue.id) {
        oldValue = value;
        array[index] = updatedValue;
      }
    });

    return oldValue;
  }

  // Public Actions

  loadRequests(requestOptions: LoadRequestsOption): Promise<any> {
    this.loadingRequestOptions = requestOptions;
    const options = buildRequestsCall(requestOptions);

    return loadCommand(options).then((response) => {
      if (this.loadingRequestOptions === requestOptions) {
        this.setRequests(response.data);
      }
      return response.data;
    }).catch((err) => {
      if (this.loadingRequestOptions === requestOptions) {
        this.setRequestsError(err);
      }
      return err;
    });
  }

  deleteRequest(row: Request): Promise<any> {
    let deleteIndex = -1;
    this.updatingReuests[row.id] = undefined;

    this.setRequests(this.requests.filter((element: Request, index, array) => {
      const needKeep = element.id !== row.id;
      if (!needKeep) {
        deleteIndex = index;
      }
      return needKeep;
    }));

    if (deleteIndex !== -1) {
      return loadCommand(buildDeleteRequestCall(row.id)).then((response) => {
        return response.data;
      }).catch((err) => {
        const insertIndex = deleteIndex < this.requests.length ? deleteIndex : this.requests.length;
        this.requests.splice(insertIndex, 0, row);
        this.setRequests(this.requests);
        return err;
      });
    }

    return Promise.resolve();
  }

  updateRequest(row: Request): Promise<any> {
    const oldValue = this.setRequest(row);

    this.updatingReuests[row.id] = row;
    return loadCommand(buildUpdateRequestCall(row)).then((response) => {
      if (this.updatingReuests[row.id] === row) {
        this.updatingReuests[row.id] = undefined;
      }
      return response.data;
    }).catch((err) => {
      if (this.updatingReuests[row.id] === row) {
        this.updatingReuests[row.id] = undefined;
        this.setRequest(oldValue);
      }
      return err;
    });
  }

  createStub(row: Request): Promise<any> {
    const options = buildCreateRequestCall(Object.assign({}, row, { isStub: true }));
    return loadCommand(options).then((response) => {
      this.setRequests([response.data].concat(this.requests));
      return response.data;
    });
  }

  loadStubGroups() {
    const call = buildStubGroupsCall();

    loadCommand(call).then((response) => {
      this.setStubGroups(response.data);
      return response.data;
    }).catch((err) => {
      this.setStubGroupsError(err);
      return err;
    });
  }
}
