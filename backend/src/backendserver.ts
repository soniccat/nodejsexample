//
// to run:
// webpack --config ./webpack.dev.js && node ./dist/main.js

import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import * as util from 'util';

import Proxy from './Proxy';
import DbConnection from './DbConnection';
import RequestTable from './RequestTable';
import ApiHandler from './ApiHandler';
import ConsoleLogger from 'main/logger/ConsoleLogger';
import EmptyLogger from 'main/logger/EmptyLogger';
import RequestLoggerExtension from 'main/logger/RequestLoggerExtension';
import LoggerCollection from 'main/logger/LoggerCollection';
import { RequestInfo } from 'main/baseTypes/RequestInfo';

// Config
const host = 'aglushkov.com';
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

const proxy = new Proxy(logger);
const dbConnection = new DbConnection(databaseUser, databasePass, databaseName);
const requestDb = new RequestTable(dbConnection);
const apiHandler = new ApiHandler(dbConnection, apiPath, logger);

const severPort = process.env.SERVER_PORT;

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  if (isApiRequest(req)) {
    apiHandler.handleRequest(req, res);
  } else {
    proxy.handleRequest(req, res)
      .then((requestInfo: RequestInfo) => {
        if (needWriteRequestRow(requestInfo)) {
          requestDb.writeRequestRowAsRequestInfo(requestInfo);
        }
      });
  }
});

server.on('error', (err) => {
  logger.log(`server error ${err}`);
  dbConnection.close();
  throw err;
});

process.on('uncaughtException', (err) => {
  logger.log(err);
  dbConnection.close();
  throw err;
});

dbConnection.connect((err) => {
  if (err) {
    throw err;
  }

  server.listen(severPort, () => {
  });
});

function needWriteRequestRow(requestInfo: RequestInfo) {
  return requestInfo.sendInfo.options.path && requestInfo.sendInfo.options.path.indexOf('api') !== -1;
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
