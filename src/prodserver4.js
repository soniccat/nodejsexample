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

        var headers = cres.headers;
        if (cres.headers["content-type"]) {
            headers["Content-Type"] = cres.headers["content-type"];
        }

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
        // we got an error, return 500 error to client and log error
        console.log(e.message);
        originalResponse.writeHead(500);
        originalResponse.end();
    });

    //console.log("path " + originalRequest.method);
    if (originalRequest.method === "POST") {
        //console.log("### body " + util.inspect(originalRequest));
        var sendPost = [];
        originalRequest.on('data', function(chunk){
            sendPost.push(chunk);
        });

        originalRequest.on('end', function() {
            var buffer = Buffer.concat(sendPost);
            console.log("post data " + buffer);
            creq.write(buffer);
            creq.end();
        });

    } else {
        creq.end();
    }
}

function getRequestOptions(req) {
    var reqUrl = url.parse(req.url);
    var redirectHost = 'news360.com';
    var needRedirect = reqUrl.host == undefined || reqUrl.host == "localhost";
    var host = needRedirect ? redirectHost : reqUrl.host;
    var path = reqUrl.path;
    //var defaultHeaders = {
    //    "Accept": "*/*"
    //};
    var defaultHeaders = req.headers;
    defaultHeaders["accept-encoding"] = "";
    if (needRedirect) {
        defaultHeaders["host"] = redirectHost;
    }
    delete defaultHeaders["if-modified-since"];
    delete defaultHeaders["if-none-match"];
    // delete defaultHeaders["host"];
    // delete defaultHeaders["referer"];
    // delete defaultHeaders["connection"];
    // delete defaultHeaders["Accept"];
    // delete defaultHeaders["accept"];
    //defaultHeaders["Accept"]  = "*/*";
    //delete defaultHeaders["accept-encoding"];

    var headers = needRedirect ? defaultHeaders : req.headers;

    var options = {
        // host to forward to
        host: host,
        // port to forward to
        port: 443,
        // path to forward to
        path: path,
        // request method
        method: req.method,
        // headers to send
        headers: headers//,
        //rejectUnauthorized: true//,
        //gzip: true
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

//console.log("out " + mime.extension('image/jpeg')) ;