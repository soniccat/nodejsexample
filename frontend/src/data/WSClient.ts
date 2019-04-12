import * as WebSocketClient from 'websocket';
import { isString } from 'util';

export interface WSMessage {
  type: string;
  data?: any;
}

export interface WSMessageHandler {
  handle(message: WSMessage): void;
  canHandle(message: WSMessage): boolean;
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
      if (isString(e.data)) {
        const jsonMessage = JSON.parse(e.data);
        if (jsonMessage != null && jsonMessage.type != null) {
          for (const h of this.handlers) {
            if (h.canHandle(jsonMessage)) {
              h.handle(jsonMessage);
              break;
            }
          }
        }
      }
    };
  }

  addHandler(handler: WSMessageHandler) {
    this.handlers.push(handler);
  }
}
