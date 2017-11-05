const fs = require('fs');
var http = require('http');
var https = require('https');
var util = require('util');
var url = require('url');
const zlib = require('zlib');
const gzip = zlib.createGzip();

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

const server = http.createServer(function(req, res) {
    handleRequest(req, res);
});

server.on('error', function (e) {
    console.log("server error " + e);
    database.end();
    throw err;
});

server.listen(8080, function () {
});

process.on('uncaughtException', function(err){
    console.log(err);
    database.end();
    throw err;
});

// request

function handleRequest(originalRequest, originalResponse) {
    prepareSendRequestInfo(originalRequest, function (sendRequestInfo) {
        prepareResponseInfo(sendRequestInfo, function (responseInfo) {
            logRequest(sendRequestInfo, responseInfo);
            if(needWriteRequestRow(sendRequestInfo, responseInfo)) {
                writeRequestRow(sendRequestInfo, responseInfo);
            }

            originalResponse.writeHead(responseInfo.statusCode , responseInfo.headers);
            if (responseInfo.body) {
                originalResponse.write(responseInfo.body);
            }
            originalResponse.end();
        })
    });
}

function prepareSendRequestInfo(originalRequest, callback) {
    var options = getRequestOptions(originalRequest);

    // is used to build a db insert query
    // contains options and body keys
    var sendData = {
        options: options
    };

    //console.log("path " + originalRequest.method);
    if (originalRequest.method === "POST") {
        readPostBody(originalRequest, function (body) {
            sendData.body = body;
            callback(sendData);
        });
    } else {
        callback(sendData);
    }
}

function prepareResponseInfo(sendRequestInfo, callback) {
    // is used to build a db insert query
    // contains headers, statusCode and body keys
    var responseInfo = {
    };

    var creq = https.request(sendRequestInfo.options, function(cres) {
        var headers = buildPoxyHeaders(cres);
        responseInfo.headers = headers;
        responseInfo.statusCode = cres.statusCode;

        var chunks = [];
        cres.on('data', function(chunk){
            chunks.push(chunk);
        });

        cres.on('close', function(){
            callback(responseInfo);
        });

        cres.on('end', function(){
            var buffer = Buffer.concat(chunks);
            handleRequestEnd(cres, buffer, function(data) {
                responseInfo.body = data;
                callback(responseInfo);
            });
        });

    }).on('error', function(e) {
        responseInfo.statusCode = 500;
        callback(responseInfo);
    });

    if (sendRequestInfo.body) {
        creq.write(sendRequestInfo.body);
    }

    creq.end();
}

function buildPoxyHeaders(cres) {
    var headers = cres.headers;
    if (cres.headers["content-type"]) {
        headers["Content-Type"] = cres.headers["content-type"];
    }
    return headers;
}

function readPostBody(originalRequest, callback) {
    //console.log("### body " + util.inspect(originalRequest));
    var sendPost = [];
    originalRequest.on('data', function (chunk) {
        sendPost.push(chunk);
    });

    originalRequest.on('end', function () {
        var buffer = Buffer.concat(sendPost);
        console.log("post data " + buffer);
        callback(buffer);
    });
}

function getRequestOptions(req) {
    var reqUrl = url.parse(req.url);
    var redirectHost = 'news360.com';
    var needRedirect = reqUrl.host == undefined || reqUrl.host == "localhost";
    var host = needRedirect ? redirectHost : reqUrl.host;
    var path = reqUrl.path;
    var defaultHeaders = req.headers;

    defaultHeaders["accept-encoding"] = "";
    if (needRedirect) {
        defaultHeaders["host"] = redirectHost;
    }

    // to avoid caching
    delete defaultHeaders["if-modified-since"];
    delete defaultHeaders["if-none-match"];

    var headers = needRedirect ? defaultHeaders : req.headers;

    var options = {
        host: host,
        port: 443,
        path: path,
        method: req.method,
        headers: headers
    };

    return options;
}

function handleRequestEnd(request, buffer, callback) {
    handleGzip(request, buffer, function (data) {

        callback(data);
    });
}

function handleGzip(cres, buffer, completion) {
    var contentEncoding = cres.headers['content-encoding'];
    if (contentEncoding) {
        var isGzip = contentEncoding.indexOf("gzip") != -1 || contentEncoding.indexOf("deflate") != -1;
        if (isGzip) {
            zlib.unzip(buffer, function (err, decoded) {
                console.log("decoding...");
                if (!err) {
                    console.log("decoded");
                    completion(decoded, undefined);
                } else {
                    console.log("error " + util.inspect(err));
                    completion(undefined, err);
                }
            });
        } else {
            completion(buffer, undefined)
        }
    } else {
        completion(buffer, undefined)
    }
}

function logRequest(sendRequestInfo, responseInfo) {
    console.log("send  " + util.inspect(sendRequestInfo));
    console.log("response  " + util.inspect(responseInfo));
}


// work with database

function needWriteRequestRow(requestInfo, responseInfo) {
    return requestInfo.options.path && requestInfo.options.path.indexOf("/api/") != -1;
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


    database.query(query, function(err, rows) {
        if (err) {
            console.log("insert error " + err);
            console.log("query " + query);
            throw err;
        } else {
            console.log("data inserted");
        }
    });

    database.end();
}

function getUrlString(requestInfo) {
    var scheme = requestInfo.port == 443 ? "https://" : "http://";
    return scheme + requestInfo.options.host + (requestInfo.options.path ? requestInfo.options.path : "");
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