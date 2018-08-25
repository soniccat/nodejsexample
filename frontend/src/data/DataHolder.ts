import StubGroup from 'Model/StubGroup';
import Request from 'Model/Request';
import { buildRequestsCall, buildCreateRequestCall, buildUpdateRequestCall, buildDeleteRequestCall } from 'Utils/RequestCalls';
import { buildStubGroupsCall } from 'Utils/StubGroupCalls';
import loadCommand from 'Utils/loadCommand';
import { LoadRequestsOption } from 'Model/LoadRequestsOption';

export default class DataHolder {
  loadingRequestOptions: LoadRequestsOption;
  requests?: Request[]; // for RequestViewer
  requestsError?: Error;

  stubGroups?: StubGroup[]; // StubGroupViewer
  stubGroupsError?: Error;

  // StubGroups

  setStubGroups(stubGroups: StubGroup[]) {
    this.stubGroups = stubGroups;
    this.onStubGroupsUpdated();
  }

  onStubGroupsUpdated() {
  }

  setStubGroupsError(error: Error) {
    this.stubGroupsError = error;
    this.onStubGroupsErrorUpdated();
  }

  onStubGroupsErrorUpdated() {
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

  // Requests

  setRequests(requests: Request[]) {
    this.requests = requests;
    this.onRequestsUpdated();
  }

  onRequestsUpdated() {
  }

  setRequestsError(error: Error) {
    this.requestsError = error;
    this.onRequestErrorUpdated();
  }

  onRequestErrorUpdated() {
  }

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
    let oldValue: Request | undefined;
    this.setRequests(this.requests.map((value: Request, index: number, array: Request[]) => {
      if (value.id === row.id) {
        oldValue = value;
        return row;
      }

      return value;
    }));

    return loadCommand(buildUpdateRequestCall(row)).catch((err) => {
      this.setRequests(this.requests.map((value: Request, index: number, array: Request[]) => {
        return (oldValue !== undefined && value.id === oldValue.id) ? oldValue : value;
      }));
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
}
