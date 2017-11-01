const fs = require('fs');
var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var util = require('util');
var url = require('url');
const zlib = require('zlib');
const gzip = zlib.createGzip();


function handleGzip(cres, buffer, completion) {
    var isGzip = cres.headers['content-encoding'] == "gzip";
    if (isGzip) {
        zlib.unzip(buffer, function(err, decoded) {
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
}

app.get('*', function(req, res) {
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
    console.log("send  " +  util.inspect(req.headers));

    var options = {
        // host to forward to
        host:   host,
        // port to forward to
        port:   443,
        // path to forward to
        path:   path,
        // request method
        method: req.method,
        // headers to send
        headers: headers,
        rejectUnauthorized: false,
        gzip: true
    };

    var creq = https.request(options, function(cres) {

        console.log("start " + path);
        console.log("response  " +  util.inspect(cres.headers));

        res.header("Content-Type", cres.headers['content-type']);

        var chunks = [];
        cres.on('data', function(chunk){
            chunks.push(chunk);
            //console.log(chunk);
        });

        cres.on('close', function(){
            // closed, let's end client request as well
        });

        cres.on('end', function(){
            res.header("Content-Type", cres.headers['content-type']);

            //console.log("end  " +  util.inspect(cres));
            //console.log(cres.body);
            var result;
            var buffer = Buffer.concat(chunks);
            handleGzip(cres, buffer, function(data) {
                var isImage = cres.headers['content-type'] == "image/jpeg" || cres.headers['content-type'] == "image/gif" || cres.headers['content-type'] == "image/png";
                if (isImage) {
                    console.log("image detected");
                    result = data;
                } else {
                    result = data.toString();
                }

                res.send(result);
            });
        });

    }).on('error', function(e) {
        // we got an error, return 500 error to client and log error
        console.log(e.message);
        //res.writeHead(500);
        res.end();
    });

    creq.end();
});

app.listen(8080, function () {

});