import Request, { IgnoreProxyStorageHeader } from 'Model/Request';
import loadCommand from 'Utils/loadCommand';
import { buildProxyUrl } from 'Utils/buildApiCall';

type HistoryItem = Request;

export default class HistoryHolder {
  items: HistoryItem[];

  onDataUpdated() {
  }

  runRequest(request: Request) {
    const proxyUrl = buildProxyUrl(request.url);
    loadCommand({
      headers: { [IgnoreProxyStorageHeader]:'true', ...request.headers },
      method: request.method,
      url: proxyUrl,
      data: request.body as object,
    }).then((response) => {
      console.log(response);
    }).catch((err) => {
      console.log(err);
    });
  }
}
