
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



var blogProxy = proxy('www.soniccat.ru', {
    https: false,
    proxyReqPathResolver: function(req) {
        console.log('redirect ' + require('url').parse(req.url).path);
        return require('url').parse(req.url).path;
    },
    userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
        console.log('response  ' + proxyResData.toString('utf8'));
        return proxyResData;
    }
});

app.use("/", blogProxy);
app.listen(4040, function() {

});