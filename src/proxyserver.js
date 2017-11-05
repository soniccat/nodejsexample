const fs = require('fs');
var http = require('http');
var https = require('https');
var util = require('util');
var url = require('url');
const zlib = require('zlib');
const gzip = zlib.createGzip();

// server

const server = http.createServer(function(req, res) {
    handleRequest(req, res);
});

server.listen(8080, function () {

});

// request

function handleRequest(originalRequest, originalResponse) {
    prepareSendRequestInfo(originalRequest, function (sendRequestInfo) {
        prepareResponseInfo(sendRequestInfo, function (responseInfo) {
            originalResponse.writeHead(responseInfo.statusCode , responseInfo.headers);
            if (responseInfo.response) {
                originalResponse.write(responseInfo.response);
            }
            originalResponse.end();
            writeRequestRow(sendRequestInfo, responseInfo);
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
    // contains headers, statusCode and response keys
    var responseInfo = {
    };

    var creq = https.request(sendRequestInfo.options, function(cres) {
        console.log("from  " + sendRequestInfo.options.host + sendRequestInfo.options.path);
        console.log("send  " + util.inspect(sendRequestInfo.options.headers));
        console.log("response  " + cres.statusCode + " " + util.inspect(cres.headers));

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
                responseInfo.response = data;
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

var Client = require('mariasql');

var c = new Client({
    host: '127.0.0.1',
    user: 'alexeyglushkov',
    password: 'pass'
});

c.query('SHOW DATABASES', function(err, rows) {
    if (err) {
        throw err;
    }
    console.dir(rows);
});

c.end();

function writeRequestRow(requestInfo, responseInfo) {
    //INSERT INTO main VALUES(NULL, 1, NOW(), "testurl", 80, 1, '{"type":"test_type", "h2":"h2data"}', 200,'{"response_type":"res_type"}', '{}', "lololo", null);
    var tableName = "main";
    var session_id = 1;

    var query = "INSERT INTO main VALUES(null";
    query += "," + session_id;
    query += ", NOW()";
    query += ", " + requestInfo.options.host + requestInfo.options.url;
    query += ", " + requestInfo.options.port;
    query += ", " + getHttpMethodCode(equestInfo.options.method);
    query += ", " + JSON.stringify(requestInfo.options.headers);

    var body_json = "NULL";
    var body_string = "NULL";
    var body_data = "NULL";
    if (requestInfo.body) {

        try {
            if (JSON.parse(requestInfo.body)){
                body_json = requestInfo.body;
            }
        } catch (ex) {
            if (typeof requestInfo.body === "string" || requestInfo instanceof String) {
                body_string = requestInfo.body;
            } else {
                // TODO: need to support blobs
                //body_data = requestInfo.body;
            }
        }

        query += ", " + body_json + ", " + body_string + ", " + body_data;
    }


    c.query('SHOW DATABASES', function(err, rows) {
        if (err) {
            throw err;
        }
        console.dir(rows);
    });

    c.end();
}

function getHttpMethodCode(name) {
    switch(name){
        case "GET": return 1;
        case "POST": return 2;
        default: return 0;
    }
}