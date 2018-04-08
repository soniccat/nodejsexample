//
// to run:
// webpack --config ./webpack.server.dev.js && node ./serverDist/main.js

const fs = require('fs');
var http = require('http');
var https = require('https');
var url = require('url');

import Proxy from "./Proxy"
import DbConnection from "./DbConnection"
import RequestTable from "./RequestTable"
import ApiHandler from "./ApiHandler"

const host = "aglushkov.com";
const apiPath = "__api__";


var proxy = new Proxy();
var dbConnection = new DbConnection();
var requestDb = new RequestTable(dbConnection);
var apiHandler = new ApiHandler(dbConnection, apiPath);

var sever_port   = process.env.SERVER_PORT;

const server = http.createServer(function(req, res) {
    if (isApiRequest(req)) {
        apiHandler.handleRequest(req, res);

    } else {
        proxy.handleRequest(req, res, function (sendInfo, responseInfo) {
            if(needWriteRequestRow(sendInfo, responseInfo)) {
                requestDb.writeRequestRow(sendInfo, responseInfo);
            }
        });
    }
});

server.on('error', function (e) {
    console.log("server error " + e);
    requestDb.close();
    throw err;
});

process.on('uncaughtException', function(err){
    console.log(err);
    requestDb.end();
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
