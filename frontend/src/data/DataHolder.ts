import StubGroup from 'Model/StubGroup';
import Request from 'Model/Request';
import { buildRequestsCall, buildCreateRequestCall, buildUpdateRequestCall, buildDeleteRequestCall } from 'Utils/RequestCalls';
import loadCommand from 'Utils/loadCommand';
import { LoadRequestsOption } from 'Model/LoadRequestsOption';

export default class DataHolder {
  loadingRequestOptions: LoadRequestsOption;
  requests?: Request[]; // for RequestViewer
  requestsError?: Error;

  stubGroups: StubGroup[]; // StubGroupViewer

  setStubGroups(stubGroups: StubGroup[]) {
    this.stubGroups = stubGroups;
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
    }).catch((err) => {
      if (this.loadingRequestOptions === requestOptions) {
        this.setRequestsError(err);
      }
    });
  }

  deleteRequest(row: Request): Promise<any> {
    return loadCommand(buildDeleteRequestCall(row.id)).then((response) => {
      this.setRequests(this.requests.filter((element: Request, index, array) => {
        return element.id !== row.id;
      }));
      return response;
    });
  }

  updateRequest(row: Request): Promise<any> {
    return loadCommand(buildUpdateRequestCall(row)).then((response) => {
      this.setRequests(this.requests.map((value: Request, index: number, array: Request[]) => {
        return value.id === row.id ? row : value;
      }));
      return response;
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
