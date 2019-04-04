import Request, { IgnoreProxyStorageHeader } from 'Model/Request';
import loadCommand from 'Utils/loadCommand';
import { buildProxyUrl } from 'Utils/buildApiCall';
import * as WebSocketClient from 'websocket';

export type HistoryItem = Request;

export default class HistoryHolder {
  items: HistoryItem[] = [];
  client: WebSocketClient.w3cwebsocket;
  connection: WebSocketClient.connection;

  constructor() {
    this.client = new WebSocketClient.w3cwebsocket('ws://localhost:7777/', 'echo-protocol');
    this.sendNumber = this.sendNumber.bind(this);

    this.client.onerror = () => {
      console.log('Connection Error');
    };

    this.client.onopen = () => {
      console.log('WebSocket Client Connected');

      this.sendNumber();
    };

    this.client.onclose = () => {
      console.log('echo-protocol Client Closed');
    };

    this.client.onmessage = (e) => {
      if (typeof e.data === 'string') {
        console.log("Received: '" + e.data + "'");
      }
    };
  }

  sendNumber() {
    if (this.client != null && this.client.readyState === this.client.OPEN) {
      const number = Math.round(Math.random() * 0xFFFFFF);
      this.client.send(number.toString());
      setTimeout(this.sendNumber, 1000);
    }
  }

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
