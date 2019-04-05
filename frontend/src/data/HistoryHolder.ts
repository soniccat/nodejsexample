import Request, { IgnoreProxyStorageHeader } from 'Model/Request';
import loadCommand from 'Utils/loadCommand';
import { buildProxyUrl } from 'Utils/buildApiCall';
import * as WebSocketClient from 'websocket';

export type HistoryItem = Request | String;

export default class HistoryHolder {
  items: HistoryItem[] = [];
  client: WebSocketClient.w3cwebsocket;

  constructor() {
    this.client = new WebSocketClient.w3cwebsocket(`ws://localhost:${BACKEND_PORT}/`, 'echo-protocol');
    this.client.onerror = () => {
      console.log('WebSocket: Connection Error');
    };

    this.client.onopen = () => {
      console.log('WebSocket: Client Connected');
    };

    this.client.onclose = () => {
      console.log('WebSocket: echo-protocol Client Closed');
    };

    this.client.onmessage = (e) => {
      if (typeof e.data === 'string') {
        console.log(`WebSocket: Received: ${e.data}`);
        this.items.push(e.data);
        this.onDataUpdated();
      }
    };
  }

  // sendNumber() {
  //   if (this.client != null && this.client.readyState === this.client.OPEN) {
  //     const number = Math.round(Math.random() * 0xFFFFFF);
  //     this.client.send(number.toString());
  //     setTimeout(this.sendNumber, 1000);
  //   }
  // }

  onDataUpdated() {
  }

  runRequest(request: Request) {
    const copyRequest = new Request();
    copyRequest.url = request.url;
    copyRequest.port = request.port;
    copyRequest.method = request.method;
    copyRequest.headers = {};//request.headers;
    for (const key in request.headers) {
      if (key !== 'user-agent' && key !== 'host' && key !== 'connection' && key !== 'accept-encoding') {
        copyRequest.headers[key] = request.headers[key];
      }
    }

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
