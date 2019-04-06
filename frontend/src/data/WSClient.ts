import * as WebSocketClient from 'websocket';

export interface WSMessageHandler {
  handle(message: any): void;
  canHandle(message: any): boolean;
}

export default class WSClient {
  client: WebSocketClient.w3cwebsocket;
  handlers: WSMessageHandler[] = [];

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
      for (const h of this.handlers) {
        if (h.canHandle(e)) {
          h.handle(e);
          break;
        }
      }
    };
  }

  addHandler(handler: WSMessageHandler) {
    this.handlers.push(handler);
  }
}
