const fs = require('fs');
var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var util = require('util');
var url = require('url');
const zlib = require('zlib');
const gzip = zlib.createGzip();

/* your app config here */

app.get('*', function(req, res) {
    var reqUrl = url.parse(req.url);
    var redirectHost = 'www.soniccat.ru';
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
        port:   80,
        // path to forward to
        path:   path,
        // request method
        method: req.method,
        // headers to send
        headers: headers,
        rejectUnauthorized: false,
        gzip: true
    };

    var creq = http.request(options, function(cres) {

        console.log("start " + path);
        console.log("response  " +  util.inspect(cres.headers));

        // set encoding
        //cres.setEncoding('utf8');
        res.header("Content-Type", cres.headers['content-type']);

        // wait for data
        var chunks = [];
        cres.on('data', function(chunk){
            //res.write(chunk);
            chunks.push(chunk);
            //console.log(chunk);
        });

        cres.on('close', function(){
            // closed, let's end client request as well
            //res.writeHead(cres.statusCode);
            //res.send(data);
            //console.log(data);
        });

        cres.on('end', function(){
            res.header("Content-Type", cres.headers['content-type']);

            //console.log("end  " +  util.inspect(cres));
            //console.log(cres.body);
            var sendString = "";
            var isGzip = cres.headers['content-encoding'] == "gzip";
            var buffer = Buffer.concat(chunks);
            if (isGzip) {
                zlib.unzip(buffer, function(err, decoded) {
                    console.log("decoding...");
                    if (!err) {
                        console.log("decoded");
                        sendString = decoded.toString();
                        res.send(sendString);
                    } else {
                        console.log("error " + util.inspect(err));
                    }
                });
            } else {
                var isImage = cres.headers['content-type'] == "image/jpeg" || cres.headers['content-type'] == "image/gif";
                if (isImage) {
                    console.log("image detected");
                    sendString = buffer;
                } else {
                    sendString = buffer.toString();
                }

                res.send(sendString);
            }
        });

    }).on('error', function(e) {
        // we got an error, return 500 error to client and log error
        console.log(e.message);
        //res.writeHead(500);
        res.end();
    });

    creq.end();
});

// app.use(express.static('./dist'));
// app.get('/mmm', function (req, res) {
//     res.header("Content-Type", "text/html");
//     res.send("override");
// });

app.listen(8080, function () {

});