import Request, { IgnoreProxyStorageHeader } from 'Model/Request';
import loadCommand from 'Utils/loadCommand';
import { buildProxyUrl } from 'Utils/buildApiCall';

export type HistoryItem = Request;

export default class HistoryHolder {
  items: HistoryItem[] = [];

  onDataUpdated() {
  }

  runRequest(request: Request) {
    const copyRequest = new Request();
    copyRequest.url = request.url;
    copyRequest.port = request.port;
    copyRequest.method = request.method;
    copyRequest.headers = request.headers;

    this.items.push(copyRequest);
    this.onDataUpdated();

    const proxyUrl = buildProxyUrl(request.url);
    loadCommand({
      headers: { [IgnoreProxyStorageHeader]:'true', ...copyRequest.headers },
      method: copyRequest.method,
      url: proxyUrl,
      data: copyRequest.body as object,
    }).then((response) => {
      copyRequest.responseStatus = response.status;
      copyRequest.responseHeaders = response.headers;
      copyRequest.responseBody = response.data;
      this.onDataUpdated();

      console.log(response);
    }).catch((err) => {
      console.log(err);
    });
  }
}
