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

    if (needRedirect) {
        console.log("send  " +  util.inspect(req.headers));
    }

    var options = {
        // host to forward to
        host:   host,
        // port to forward to
        port:   80,
        // path to forward to
        path:   path,
        // request method
        method: 'GET',
        // headers to send
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "text"
        },
        rejectUnauthorized: false
    };

    var creq = http.request(options, function(cres) {

        console.log("start " + path);

        // set encoding
        cres.setEncoding('utf8');
        res.header("Content-Type", cres.headers['content-type']);

        // wait for data
        var data = "";
        cres.on('data', function(chunk){
            //res.write(chunk);
            data += chunk;
            //console.log(chunk);
        });

        cres.on('close', function(){
            // closed, let's end client request as well
            //res.writeHead(cres.statusCode);
            res.send(data);
            //console.log(data);
        });

        cres.on('end', function(){
            // finished, let's finish client request as well
            //res.writeHead(cres.statusCode);

            // const d = Buffer.from('eJzT0yMA', 'base64');
            // zlib.unzip(d, function(err, buffer) {
            //     if (!err) {
            //         var result = buffer.toString();
            //         res.send(result);
            //         console.log(result);
            //     } else {
            //         console.log("zlib error");
            //     // handle error
            //     }
            // });


            //res.header("Content-Type", res.headers['content-type']);
            res.send(data);
            //console.log(data);
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