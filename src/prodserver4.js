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
    var options = getRequestOptions(originalRequest);

    var creq = https.request(options, function(cres) {
        console.log("from  " + originalRequest.url);
        console.log("send  " + util.inspect(originalRequest.headers));
        console.log("response  " + cres.statusCode + " " + util.inspect(cres.headers));

        var headers = buildPoxyHeaders(cres);
        originalResponse.writeHead(cres.statusCode , headers);

        var chunks = [];
        cres.on('data', function(chunk){
            chunks.push(chunk);
        });

        cres.on('close', function(){
            originalResponse.end();
        });

        cres.on('end', function(){
            var buffer = Buffer.concat(chunks);
            handleRequestEnd(cres, buffer, function(data) {
                originalResponse.write(data);
                originalResponse.end();
            });
        });

    }).on('error', function(e) {
        console.log(e.message);
        originalResponse.writeHead(500);
        originalResponse.end();
    });

    //console.log("path " + originalRequest.method);
    if (originalRequest.method === "POST") {
        readPostBody(originalRequest, function (body) {
            creq.write(body);
            creq.end();
        });

    } else {
        creq.end();
    }
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
