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
        console.log("from  " +  originalRequest.url);
        console.log("response  " +  util.inspect(cres.headers));

        originalResponse.writeHead(200, cres.headers);

        var chunks = [];
        cres.on('data', function(chunk){
            chunks.push(chunk);
        });

        cres.on('close', function(){
        });

        cres.on('end', function(){
            var buffer = Buffer.concat(chunks);
            handleRequestEnd(cres, buffer, originalResponse);
        });

    }).on('error', function(e) {
        // we got an error, return 500 error to client and log error
        console.log(e.message);
        originalResponse.writeHead(500);
        originalResponse.end();
    });

    creq.end();
}

function getRequestOptions(req) {
    var reqUrl = url.parse(req.url);
    var redirectHost = 'news360.com';
    console.log("host  " + reqUrl.host);
    var needRedirect = reqUrl.host == undefined || reqUrl.host == "localhost";
    var host = needRedirect ? redirectHost : reqUrl.host;
    var path = reqUrl.path;
    var defaultHeaders = {
        "Accept": "*/*"
    };
    var headers = needRedirect ? defaultHeaders : req.headers;
    //console.log("send  " + util.inspect(req.headers));

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
        headers: headers,
        rejectUnauthorized: false,
        gzip: true
    };
    return options;
}

function handleRequestEnd(request, buffer, out) {
    handleGzip(request, buffer, function (data) {
        var result = "";
        var isImage = request.headers['content-type'] == "image/jpeg" || request.headers['content-type'] == "image/gif" || request.headers['content-type'] == "image/png";
        if (isImage) {
            console.log("image detected");
            result = data;
        } else {
            result = data.toString();
        }

        out.write(result, "utf8");
        out.end();
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
