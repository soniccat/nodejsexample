import {readPostBody, logRequest} from "./requesttools.js"
import https from 'https'
import url from 'url'
import zlib from 'zlib'

let gzip = zlib.createGzip();

class Proxy {

    handleRequest(originalRequest, originalResponse, callback) {
        this.prepareRequestInfo(originalRequest, sendRequestInfo => {
            this.prepareResponseInfo(sendRequestInfo, responseInfo => {
                logRequest(sendRequestInfo, responseInfo);
                originalResponse.writeHead(responseInfo.statusCode , responseInfo.headers);
                if (responseInfo.body) {
                    originalResponse.write(responseInfo.body);
                }
                originalResponse.end();

                if (callback) {
                    callback(sendRequestInfo, responseInfo)
                }
            });
        });
    }

    prepareRequestInfo(originalRequest, callback) {
        let options = this.getRequestOptions(originalRequest);

        // is used to build a db insert query
        // contains options and body keys
        let requestInfo = {
            options: options
        };

        readPostBody(originalRequest, body => {
            if (body) {
                requestInfo.body = body;
            }

            callback(requestInfo);
        });
    }

    getRequestOptions(req) {
        let reqUrl = url.parse(req.url);
        let redirectHost = 'news360.com';
        let needRedirect = reqUrl.host == undefined || reqUrl.host == "localhost";
        let host = needRedirect ? redirectHost : reqUrl.host;
        let path = reqUrl.path;
        let defaultHeaders = req.headers;

        defaultHeaders["accept-encoding"] = "";
        if (needRedirect) {
            defaultHeaders["host"] = redirectHost;
        }

        // to avoid caching
        delete defaultHeaders["if-modified-since"];
        delete defaultHeaders["if-none-match"];
        delete defaultHeaders["origin"];
        delete defaultHeaders["referer"];

        let headers = needRedirect ? defaultHeaders : req.headers;

        let options = {
            host: host,
            port: 443,
            path: path,
            method: req.method,
            headers: headers
        };

        return options;
    }

    prepareResponseInfo(sendRequestInfo, callback) {
        // is used to build a db insert query
        // contains headers, statusCode and body keys
        let responseInfo = {
        };

        let creq = https.request(sendRequestInfo.options, cres => {
            let headers = this.buildPoxyHeaders(cres);
            responseInfo.headers = headers;
            responseInfo.statusCode = cres.statusCode;

            let chunks = [];
            cres.on('data', chunk => {
                chunks.push(chunk);
            });

            cres.on('close', () => {
                callback(responseInfo);
            });

            cres.on('end', () => {
                let buffer = Buffer.concat(chunks);
                this.handleRequestEnd(cres, buffer, data => {
                    responseInfo.body = data;
                    callback(responseInfo);
                });
            });

        }).on('error', e => {
            responseInfo.statusCode = 500;
            callback(responseInfo);
        });

        if (sendRequestInfo.body) {
            creq.write(sendRequestInfo.body);
        }

        creq.end();
    }

    buildPoxyHeaders(cres) {
        let headers = cres.headers;
        if (cres.headers["content-type"]) {
            headers["Content-Type"] = cres.headers["content-type"];
        }
        return headers;
    }

    handleRequestEnd(request, buffer, callback) {
        this.handleGzip(request, buffer, data => {
            callback(data);
        });
    }

    handleGzip(cres, buffer, completion) {
        let contentEncoding = cres.headers['content-encoding'];
        if (contentEncoding) {
            let isGzip = contentEncoding.indexOf("gzip") != -1 || contentEncoding.indexOf("deflate") != -1;
            if (isGzip) {
                zlib.unzip(buffer, (err, decoded) => {
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