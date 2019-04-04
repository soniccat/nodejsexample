//
// to run:
// webpack --config ./webpack.dev.js && node ./dist/main.js

import * as http from 'http';
import * as url from 'url';
import * as util from 'util';
import * as websocket from 'websocket';

import Proxy from 'Proxy/Proxy';
import DbConnection from 'DB/DbConnection';
import RequestTable from 'DB/RequestTable';
import ApiHandler from 'main/api/ApiHandler';
import ConsoleLogger from 'Logger/ConsoleLogger';
import RequestLoggerExtension from 'Logger/RequestLoggerExtension';
import LoggerCollection from 'Logger/LoggerCollection';
import { RequestInfo } from 'Data/request/RequestInfo';
import { LogLevel } from 'Logger/ILogger';
import { StubGroupTable } from 'DB/StubGroupTable';
import SessionManager from 'main/session/SessionManager';
import SendInfo, { SendInfoBuilder } from 'Data/request/SendInfo';
import { IgnoreProxyStorageHeader } from 'Model/Request';
import WSLogger from 'Logger/WSLogger';

// Config
const host = 'news360.com';
const apiPath = '__api__';

const databaseUser = process.env.DB_USER;
const databasePass = process.env.DB_PASS;
const databaseName = 'db_requests';

if (!databaseUser || !databasePass) {
  throw new Error('setup your DB_USER and DB_PASS environment variables');
}

const server = http.createServer(onServerMessage);
const wsServer = new websocket.server({
  httpServer: server,
  autoAcceptConnections: false,
});

const consoleLogger = new ConsoleLogger();
const wsLogger = new WSLogger(wsServer);
const logger = new LoggerCollection([[new RequestLoggerExtension(consoleLogger), consoleLogger]]);

const sendInfoBuilder = new SendInfoBuilder(host);
const proxy = new Proxy(logger);
const dbConnection = new DbConnection(databaseUser, databasePass, databaseName);
const requestDb = new RequestTable(dbConnection);
const stubGroupTable = new StubGroupTable(dbConnection);
const sessionManager = new SessionManager(stubGroupTable, new LoggerCollection([[wsLogger], [consoleLogger]]));
const apiHandler = new ApiHandler(dbConnection, sessionManager, apiPath, logger);

const severPort = process.env.SERVER_PORT;

function onServerMessage(req: http.IncomingMessage, res: http.ServerResponse) {
  if (isApiRequest(req)) {
    apiHandler.handleRequest(req, res).then((res) => {
      res.end();
    });
  } else {
    sendInfoBuilder.build(req).then((sendInfo) => {
      return sessionManager.process(sendInfo, res).then((response) => {
        if (response != null) {
          logger.log(LogLevel.DEBUG, `stub applied for ${sendInfo.path}`);
          return response;
        }
        return undefined;
      }).catch((e) => {
        logger.log(LogLevel.ERROR, `sessionManager.process error ${util.inspect(e)} for ${req.url}`);
        return undefined;
      }).then((response) => {
        // keep response if it was processed successfully by sessionManager
        return response != null ? response : handleReuestWithProxy(sendInfo, res);
      });
    }).catch((e) => {
      logger.log(LogLevel.ERROR, `sendInfoBuilder.build error ${util.inspect(e)} for ${req.url}`);
    }).then((o) => {
      res.end();
    });
  }
}

///// ws test

wsServer.on('request', (request) => {
  const connection = request.accept('echo-protocol', request.origin);
  console.log(`${new Date()} Connection accepted.`);
  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      console.log(`Received Message: ${message.utf8Data}`);
      connection.sendUTF(message.utf8Data!);
    } else if (message.type === 'binary') {
      console.log(`Received Binary Message of ${message.binaryData!.length} bytes`);
      connection.sendBytes(message.binaryData!);
    }
  });
  connection.on('close', (reasonCode, description) => {
    console.log(`${new Date()} Peer ${connection.remoteAddress} disconnected.`);
  });
});

/////

async function handleReuestWithProxy(sendInfo: SendInfo, res: http.ServerResponse): Promise<http.ServerResponse> {
  return proxy.handleRequest(sendInfo, res)
      .then((requestInfo: RequestInfo) => {
        if (needWriteRequestRow(requestInfo)) {
          const name = getDateString();
          requestDb.writeRequestAsRequestInfo(name, requestInfo).then((rows:any[]) => {
            logger.log(LogLevel.DEBUG, `added to DB ${requestInfo.sendInfo.path}`);
          });
        }
        return res;
      });
}

function getDateString(): string {
  const d = new Date();
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
}

server.on('error', (err) => {
  logger.log(LogLevel.ERROR, `server error ${err}`);
  dbConnection.close();
  throw err;
});

process.on('uncaughtException', (err) => {
  logger.log(LogLevel.ERROR, err);
  dbConnection.close();
  throw err;
});

// Start
dbConnection.connect((err) => {
  if (err) {
    throw err;
  }

  stubGroupTable.loadStubGroups().then(() => {
    server.listen(severPort, () => {
    });
  });
});

function needWriteRequestRow(requestInfo: RequestInfo) {
  return requestInfo.sendInfo.path &&
    requestInfo.sendInfo.path.indexOf('api') !== -1 &&
    requestInfo.sendInfo.method !== 'OPTIONS' &&
    requestInfo.sendInfo.headers[IgnoreProxyStorageHeader] === undefined;
}

function isApiRequest(req: http.IncomingMessage) {
  if (req.url === undefined) {
    return false;
  }

  const reqUrl = url.parse(req.url);
  const isHostValid = reqUrl.host == null || reqUrl.host === 'localhost' || reqUrl.host === host;

  if (reqUrl.path === undefined) {
    return false;
  }

  const path = reqUrl.path.length > 0 ? reqUrl.path.substr(1) : ''; // remove starting '/'
  const isPathValid = path.startsWith(apiPath);

  return isHostValid && isPathValid;
}
