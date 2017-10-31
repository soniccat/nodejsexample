process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const fs = require('fs');
var express = require('express');
var app = express();
const proxy = require('express-http-proxy');
//var content = fs.readFileSync('./dist/index.html');

// app.use(express.static('./dist'));
// app.get('/mmm', function (req, res) {
//     res.header("Content-Type", "text/html");
//     res.send("override");
// });
//
// app.listen(80, function () {
//
// });

var caCert = fs.readFileSync('./src/charles-ssl-proxying-certificate.pem', 'utf8');
var charles = fs.readFileSync('./src/charles.pem', 'utf8');
var exported = fs.readFileSync('./src/exported.pem', 'utf8');

var blogProxy = proxy('67.21.6.78:443', {
    https: true,
    proxyReqPathResolver: function(req) {
        console.log('redirect ' + require('url').parse(req.url).path);
        return require('url').parse(req.url).path;
    },
    userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
        console.log('response  ' + proxyResData.toString('utf8'));
        return proxyResData;
    }//,
    // proxyReqOptDecorator: function(proxyReqOpts, originalReq) {
    //     console.log('cert');
    //     proxyReqOpts.ca =  [caCert, charles, exported];
    //     return proxyReqOpts;
    // }
});

app.use("/", blogProxy);
app.listen(4040, function() {

});