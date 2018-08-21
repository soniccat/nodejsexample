//
// to run:
// webpack --config ./webpack.dev.js && node ./dist/main.js

import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import * as util from 'util';

import Proxy from 'Proxy/Proxy';
import DbConnection from 'DB/DbConnection';
import RequestTable from 'DB/RequestTable';
import ApiHandler from 'main/api/ApiHandler';
import ConsoleLogger from 'Logger/ConsoleLogger';
import EmptyLogger from 'Logger/EmptyLogger';
import RequestLoggerExtension from 'Logger/RequestLoggerExtension';
import LoggerCollection from 'Logger/LoggerCollection';
import { RequestInfo } from 'Data/request/RequestInfo';
import { LogLevel } from 'Logger/ILogger';
import { StubGroupTable } from 'DB/StubGroupTable';

// Config
const host = 'news360.com';
const apiPath = '__api__';

const databaseUser = process.env.DB_USER;
const databasePass = process.env.DB_PASS;
const databaseName = 'db_requests';

if (!databaseUser || !databasePass) {
  throw new Error('setup your DB_USER and DB_PASS environment variables');
}

//
const consoleLogger = new ConsoleLogger();
const logger = new LoggerCollection([new RequestLoggerExtension(consoleLogger), consoleLogger]);

const proxy = new Proxy('news360.com', logger);
const dbConnection = new DbConnection(databaseUser, databasePass, databaseName);
const requestDb = new RequestTable(dbConnection);
const stubGroupDb = new StubGroupTable(dbConnection);
const apiHandler = new ApiHandler(dbConnection, apiPath, logger);

const severPort = process.env.SERVER_PORT;

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  if (isApiRequest(req)) {
    apiHandler.handleRequest(req, res)
    .then((res) => {
      res.end();
    });
  } else {
    proxy.handleRequest(req, res)
      .then((requestInfo: RequestInfo) => {
        res.end();
        if (needWriteRequestRow(requestInfo)) {
          requestDb.writeRequestAsRequestInfo(requestInfo).then((rows:any[]) => {
            logger.log(LogLevel.DEBUG, `added to DB ${requestInfo.sendInfo.path}`);
          });
        }
      });
  }
});

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

dbConnection.connect((err) => {
  if (err) {
    throw err;
  }

  stubGroupDb.loadStubGroups().then(() => {
    server.listen(severPort, () => {
    });
  });
});

function needWriteRequestRow(requestInfo: RequestInfo) {
  return requestInfo.sendInfo.path && requestInfo.sendInfo.path.indexOf('api') !== -1;
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
