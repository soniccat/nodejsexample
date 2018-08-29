import StubGroup from 'Model/StubGroup';
import Request from 'Model/Request';
import { buildRequestsCall, buildCreateRequestCall, buildUpdateRequestCall, buildDeleteRequestCall } from 'Utils/RequestCalls';
import { buildStubGroupsCall, buildAddRequestToStubGroupCall, buildDeleteRequestFromStubGroupCall, buildCreateStubGroupCall, buildDeleteStubGroupCall } from 'Utils/StubGroupCalls';
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

  // === Setters

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

  // === Data Synching

  private syncWithRequests() {
    // build a temporary map
    const requestMap: {[id: number] : Request} = {};
    const requests = this.requests != null ? this.requests : [];
    requests.forEach((request: Request, index: number, array: Request[]) => {
      requestMap[request.id] = request;
    });

    // update requests in stubGroups
    const goups = this.stubGroups != null ? this.stubGroups : [];
    goups.forEach((group: StubGroup, index: number, array: StubGroup[]) => {
      group.requests.forEach((request: Request, index: number, array: Request[]) => {
        if (requestMap[request.id]) {
          array[index] = requestMap[request.id];
        }
      });
    });
  }

  private syncWithRequest(updatedRequest: Request) {
    const requests = this.requests != null ? this.requests : [];
    this.updateInList(updatedRequest, requests);

    const goups = this.stubGroups != null ? this.stubGroups : [];
    goups.forEach((group: StubGroup, index: number, array: StubGroup[]) => {
      this.updateInList(updatedRequest, group.requests);
    });
  }

  private syncWithStubGroups() {
    // build a temporary map
    const requestMap: {[id: number] : Request} = {};
    const goups = this.stubGroups != null ? this.stubGroups : [];
    goups.forEach((group: StubGroup, index: number, array: StubGroup[]) => {
      group.requests.forEach((request: Request, index: number, array: Request[]) => {
        requestMap[request.id] = request;
      });
    });

    // update requests
    const requests = this.requests != null ? this.requests : [];
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

  stubGroupById(id: number): StubGroup | undefined {
    return this.stubGroups.find(obj => obj.id === id);
  }

  requestById(id: number): Request | undefined {
    let request = this.requests.find(obj => obj.id === id);
    if (request === undefined) {
      this.stubGroups.forEach((group) => {
        if (request === undefined) {
          request = group.requests.find(obj => obj.id === id);
        }
      });
    }

    return request;
  }

  // === Public Actions

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

  loadStubGroups(): Promise<any> {
    const call = buildStubGroupsCall();

    return loadCommand(call).then((response) => {
      this.setStubGroups(response.data);
      return response.data;
    }).catch((err) => {
      this.setStubGroupsError(err);
      return err;
    });
  }

  addRequestInStubGroup(stubGroupId: number, requestId: number) {
    const call = buildAddRequestToStubGroupCall(stubGroupId, requestId);
    const stubGroup = this.stubGroupById(stubGroupId);
    const request = this.requestById(requestId);
    stubGroup.requests.push(request);
    this.onDataUpdated();

    loadCommand(call).then((response) => {
      return response.data;
    }).catch((err) => {
      stubGroup.requests = stubGroup.requests.filter(obj => obj !== request);
      this.onDataUpdated();
      return err;
    });
  }

  deleteRequestFromStubGroup(stubGroupId: number, requestId: number) {
    const call = buildDeleteRequestFromStubGroupCall(stubGroupId, requestId);
    const stubGroup = this.stubGroupById(stubGroupId);
    let request: Request | undefined;
    let requestIndex = -1;
    stubGroup.requests = stubGroup.requests.filter((obj:Request, index: number) => {
      if (obj.id === requestId) {
        request = obj;
        requestIndex = index;
        return false;
      }

      return true;
    });
    this.onDataUpdated();

    loadCommand(call).then((response) => {
      return response.data;
    }).catch((err) => {
      if (request != null) {
        const insertIndex = requestIndex < stubGroup.requests.length ? requestIndex : stubGroup.requests.length;
        stubGroup.requests.splice(insertIndex, 0, request);
        this.onDataUpdated();
      }
      return err;
    });
  }

  createStubGroup(name: string): Promise<any> {
    const call = buildCreateStubGroupCall(name);

    return loadCommand(call).then((response) => {
      this.stubGroups.push(response.data);
      this.onDataUpdated();
      return response.data;
    }).catch((err) => {
      this.onDataUpdated();
      return err;
    });
  }

  deleteStubGroup(id: number): Promise<any> {
    const call = buildDeleteStubGroupCall(id);
    let stubGroupIndex = -1;
    let stubGroup: StubGroup | undefined;
    this.stubGroups = this.stubGroups.filter((obj: StubGroup, index: number) => {
      if (obj.id === id) {
        stubGroup = obj;
        stubGroupIndex = index;
        return false;
      }

      return true;
    });
    this.onDataUpdated();

    return loadCommand(call).then((response) => {
      return response.data;
    }).catch((err) => {
      if (stubGroup != null) {
        const insertIndex = stubGroupIndex < this.stubGroups.length ? stubGroupIndex : this.stubGroups.length;
        this.stubGroups.splice(insertIndex, 0, stubGroup);
        this.onDataUpdated();
      }
      return err;
    });
  }
}
