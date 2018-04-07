const fs = require('fs');
var http = require('http');
var https = require('https');
var util = require('util');
var url = require('url');

import Proxy from "./proxy.js"
import {readPostBody, getUrlString} from "./requesttools.js"

const zlib = require('zlib');
const gzip = zlib.createGzip();

const host = "aglushkov.com";
const apiPath = "__api__";


var proxy = new Proxy();

// database

var Client = require('mariasql');

var database_user   = process.env.DB_USER;
var database_pass   = process.env.DB_PASS;

var database = new Client({
    host: '127.0.0.1',
    user: database_user,
    password: database_pass,
    db: "db_requests"
});

// server

var sever_port   = process.env.SERVER_PORT;

const server = http.createServer(function(req, res) {
    if (isApiRequest(req)) {
        handleApiRequest(req, res);

    } else {
        proxy.handleRequest(req, res, function (sendInfo, responseInfo) {
            if(needWriteRequestRow(sendInfo, responseInfo)) {
                writeRequestRow(sendInfo, responseInfo);
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

function writeRequestRow(requestInfo, responseInfo) {
    //INSERT INTO main VALUES(NULL, 1, NOW(), "testurl", 80, 1, '{"type":"test_type", "h2":"h2data"}', 200,'{"response_type":"res_type"}', '{}', "lololo", null);
    var tableName = "main";
    var session_id = 1;

    var query = "INSERT INTO main VALUES(null";
    query += "," + session_id;
    query += ", NOW()";
    query += ", " + wrapString(getUrlString(requestInfo));
    query += ", " + requestInfo.options.port;
    query += ", " + getHttpMethodCode(requestInfo.options.method);
    query += ", " + (requestInfo.options.headers ? wrapString(JSON.stringify(requestInfo.options.headers)) : "NULL");

    var body_json = "NULL";
    var body_string = "NULL";
    var body_data = "NULL";

    var isBodyString = requestInfo.body && isValidUTF8(requestInfo.body);
    if (requestInfo.body) {
        if (isBodyString && isJsonString(requestInfo.body.toString())) {
            body_json = wrapString(requestInfo.body.toString());

        }else if (isBodyString) {
            body_string = wrapString(requestInfo.body.toString());

        } else {
            // TODO: need to support blobs
            //body_data = requestInfo.body;
        }
    }
    query += ", " + body_json + ", " + body_string + ", " + body_data;

    query += ", " + responseInfo.statusCode;
    query += ", " + (responseInfo.header ? wrapString(JSON.stringify(responseInfo.header)) : "NULL");

    var response_json = "NULL";
    var response_string = "NULL";
    var response_data = "NULL";

    var isResponseBodyString = responseInfo.body && isValidUTF8(responseInfo.body);
    if (responseInfo.body) {
        if (isResponseBodyString && isJsonString(responseInfo.body.toString())){
            response_json = wrapString(responseInfo.body.toString());
        } else if (isResponseBodyString) {
            response_string = wrapString(responseInfo.body.toString());
        } else {
            // TODO: need to support blobs
            //response_data = responseInfo.body;
        }
    }
    query += ", " + response_json + ", " + response_string + ", " + response_data;

    query += ");";


    console.log("start inserting ");
    database.query(query, function(err, rows) {
        if (err) {
            console.log("insert error " + err);
            console.log("query " + query);
            //throw err;
        } else {
            console.log("data inserted");
        }
    });

    database.end();
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
    database.query(query, function(err, rows) {
        callback(err, rows);
    });

    database.end();
}

function wrapString(value) {
    return "\"" + Client.escape(value) + "\"";
}

function isValidUTF8(buf){
    return Buffer.compare(new Buffer(buf.toString(),'utf8') , buf) === 0;
}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function getHttpMethodCode(name) {
    switch(name){
        case "GET": return 1;
        case "POST": return 2;
        default: return 0;
    }
}