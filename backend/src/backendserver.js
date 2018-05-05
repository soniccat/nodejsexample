//
// to run:
// webpack --config ./webpack.dev.js && node ./dist/main.js

import http from 'http';
import https from 'https';
import url from 'url';

import Proxy from './Proxy';
import DbConnection from './DbConnection';
import RequestTable from './RequestTable';
import ApiHandler from './ApiHandler';
import ConsoleLogger from 'main/logger/ConsoleLogger';
import EmptyLogger from 'main/logger/EmptyLogger';
import RequestLoggerExtension from 'main/logger/RequestLoggerExtension';
import util from 'util';

// Config
const host = 'aglushkov.com';
const apiPath = '__api__';

const databaseUser = process.env.DB_USER;
const databasePass = process.env.DB_PASS;
const databaseName = 'db_requests';

// //
const logger = new RequestLoggerExtension(new ConsoleLogger());

const proxy = new Proxy(logger);
const dbConnection = new DbConnection(databaseUser, databasePass, databaseName);
const requestDb = new RequestTable(dbConnection);
const apiHandler = new ApiHandler(dbConnection, apiPath, logger);

const severPort = process.env.SERVER_PORT;

const server = http.createServer((req, res) => {
  if (isApiRequest(req)) {
    apiHandler.handleRequest(req, res);
  } else {
    proxy.handleRequest(req, res)
      .then(([sendInfo, responseInfo]) => {
        if (needWriteRequestRow(sendInfo, responseInfo)) {
          requestDb.writeRequestRowAsRequestInfo(sendInfo, responseInfo);
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

function needWriteRequestRow(requestInfo, responseInfo) {
  return requestInfo.options.path && requestInfo.options.path.indexOf('api') !== -1;
}

function isApiRequest(req) {
  const reqUrl = url.parse(req.url);
  const isHostValid = reqUrl.host == null || reqUrl.host === 'localhost' || reqUrl.host === host;
  const path = reqUrl.path.length > 0 ? reqUrl.path.substr(1) : ''; // remove starting '/'
  const isPathValid = path.startsWith(apiPath);

  return isHostValid && isPathValid;
}
