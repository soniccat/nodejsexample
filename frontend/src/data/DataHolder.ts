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
}
