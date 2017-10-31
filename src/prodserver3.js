var https = require('https');
var httpProxy = require('http-proxy');

httpProxy.createProxyServer({
    target: 'https://news360.com',
    agent  : https.globalAgent,
    headers: {
        host: 'news360.com'
    }
}).listen(8011);
