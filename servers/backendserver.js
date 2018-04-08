//
// webpack --config ./webpack.server.dev.js && node ./serverDist/main.js

const fs = require('fs');
var http = require('http');
var https = require('https');
var util = require('util');
var url = require('url');

import Proxy from "./Proxy.js"
import RequestResponseDb from "./RequestResponseDb.js"
import {readPostBody, getUrlString} from "./requesttools.js"

const host = "aglushkov.com";
const apiPath = "__api__";


var proxy = new Proxy();
var requestDb = new RequestResponseDb();

// server

var sever_port   = process.env.SERVER_PORT;

const server = http.createServer(function(req, res) {
    if (isApiRequest(req)) {
        handleApiRequest(req, res);

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
    database.end();
    throw err;
});

server.listen(sever_port, function () {
});

process.on('uncaughtException', function(err){
    console.log(err);
    database.end();
    throw err;
});

// api

function isApiRequest(req) {
    const reqUrl = url.parse(req.url);
    const isHostValid = reqUrl.host == undefined || reqUrl.host == "localhost" || reqUrl.host == host;
    const path = reqUrl.path.length > 0 ? reqUrl.path.substr(1) : ""; // remove starting '/'
    const isPathValid = path.startsWith(apiPath);
    return isHostValid && isPathValid;
}

function handleApiRequest(req, res) {
    const reqUrl = url.parse(req.url);
    const path = reqUrl.path.substr(apiPath.length + 2); // +2 for double '/' at the beginning and end
    const components = path.split('/');

    // allow Cross-Origin Resource Sharing preflight request
    if (req.method == "OPTIONS") {
        res.writeHeader(200, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "X-PINGOTHER, Content-Type"
        });
        res.end();

    } else {
        readPostBody(req, function (body) {
            handleApiComponents(components, body, res, function () {
                res.end();
            });
        });
    }
}

function handleApiComponents(components, body, res, callback) {
    if (components.length > 0 && components[0] == "requests") {
        handleRequests(body, res, function () {
            callback();
        });

    } else {
        fillNotFoundResponse(res);
        callback();
    }
}

function handleRequests(body, res, callback) {
    let options = JSON.parse(body.toString());
    loadRequests(options, function (err, rows) {
        console.dir(body);
        console.dir(rows);

        var code;
        var body;
        if (err == undefined ) {
            code = 200;
            body = JSON.stringify(rows);

        } else {
            code = 500;
        }

        res.writeHead(code, {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        });
        if (body) {
            res.write(body);
        }

        callback()
    })
}

function fillNotFoundResponse(res) {
    res.writeHead(404);
}

// work with database

function needWriteRequestRow(requestInfo, responseInfo) {
    return requestInfo.options.path && requestInfo.options.path.indexOf("api") != -1;
}

function loadRequests(options, callback) {
    var fields = "*";
    if (options.fields) {
        fields = options.fields.join(',');
    }

    var wherePart = "";
    var urlRegexp = "";
    if (options.urlRegexp) {
        urlRegexp = options.urlRegexp;
        wherePart += "url REGEXP " + "\"" + urlRegexp + "\"";
    }

    if (options.onlyNotNull && options.fields) {
        for (i = 0; i < options.fields.length; i++) {
            if (wherePart.length > 0) {
                wherePart += " AND "
            }
            wherePart += options.fields[i] +" IS NOT NULL ";
        }
    }

    var query = "select " + fields + " from main";
    if (wherePart.length) {
        query += " where " + wherePart;
    }

    console.log("query " + query);
    
    requestDb.performQuery(query, callback);
}