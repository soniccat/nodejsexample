import {readPostBody, logRequest} from "./requesttools.js"
import https from 'https'
import url from 'url'

class Proxy {

    // callback
    //
    handleRequest(originalRequest, originalResponse, callback) {
        let caller = this;
        this.prepareSendRequestInfo(originalRequest, function (sendRequestInfo) {
            caller.prepareResponseInfo(sendRequestInfo, function (responseInfo) {
                logRequest(sendRequestInfo, responseInfo);
                originalResponse.writeHead(responseInfo.statusCode , responseInfo.headers);
                if (responseInfo.body) {
                    originalResponse.write(responseInfo.body);
                }
                originalResponse.end();

                if (callback) {
                    callback(sendRequestInfo, responseInfo)
                }
            })
        });
    }

    prepareSendRequestInfo(originalRequest, callback) {
        let options = this.getRequestOptions(originalRequest);

        // is used to build a db insert query
        // contains options and body keys
        let sendData = {
            options: options
        };

        readPostBody(originalRequest, function (body) {
            if (body) {
                sendData.body = body;
            }

            callback(sendData);
        });
    }

    prepareResponseInfo(sendRequestInfo, callback) {
        // is used to build a db insert query
        // contains headers, statusCode and body keys
        var responseInfo = {
        };

        let caller = this;
        var creq = https.request(sendRequestInfo.options, function(cres) {
            var headers = caller.buildPoxyHeaders(cres);
            responseInfo.headers = headers;
            responseInfo.statusCode = cres.statusCode;

            var chunks = [];
            cres.on('data', function(chunk){
                chunks.push(chunk);
            });

            cres.on('close', function(){
                callback(responseInfo);
            });

            cres.on('end', function() {
                var buffer = Buffer.concat(chunks);
                caller.handleRequestEnd(cres, buffer, function(data) {
                    responseInfo.body = data;
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

    buildPoxyHeaders(cres) {
        var headers = cres.headers;
        if (cres.headers["content-type"]) {
            headers["Content-Type"] = cres.headers["content-type"];
        }
        return headers;
    }

    getRequestOptions(req) {
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
        delete defaultHeaders["origin"];
        delete defaultHeaders["referer"];

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

    handleRequestEnd(request, buffer, callback) {
        this.handleGzip(request, buffer, function (data) {
            callback(data);
        });
    }

    handleGzip(cres, buffer, completion) {
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
}

export default Proxy;