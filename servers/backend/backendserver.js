//
// to run:
// webpack --config ./webpack.server.dev.js && node ./serverDist/main.js

import http from'http'
import https from 'https'
import url from 'url'

import Proxy from "./Proxy"
import DbConnection from "./DbConnection"
import RequestTable from "./RequestTable"
import ApiHandler from "./ApiHandler"

const host = "aglushkov.com";
const apiPath = "__api__";


const proxy = new Proxy();
const dbConnection = new DbConnection();
const requestDb = new RequestTable(dbConnection);
const apiHandler = new ApiHandler(dbConnection, apiPath);

let sever_port = process.env.SERVER_PORT;

const server = http.createServer((req, res) => {
    if (isApiRequest(req)) {
        apiHandler.handleRequest(req, res);

    } else {
        proxy.handleRequest(req, res, (sendInfo, responseInfo) => {
            if(needWriteRequestRow(sendInfo, responseInfo)) {
                requestDb.writeRequestRow(sendInfo, responseInfo);
            }
        });
    }
});

server.on('error', function (e) {
    console.log("server error " + e);
    dbConnection.close();
    throw err;
});

process.on('uncaughtException', (err) => {
    console.log(err);
    dbConnection.close();
    throw err;
});

dbConnection.connect(err => {
    if (err) {
        throw err;
    }

    server.listen(sever_port, function () {
    });
});

function needWriteRequestRow(requestInfo, responseInfo) {
    return requestInfo.options.path && requestInfo.options.path.indexOf("api") != -1;
}

function isApiRequest(req) {
    const reqUrl = url.parse(req.url);
    const isHostValid = reqUrl.host == undefined || reqUrl.host == "localhost" || reqUrl.host == host;
    const path = reqUrl.path.length > 0 ? reqUrl.path.substr(1) : ""; // remove starting '/'
    const isPathValid = path.startsWith(apiPath);
    return isHostValid && isPathValid;
}
