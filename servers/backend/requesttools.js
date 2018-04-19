import util from 'util'

export function readPostBody(originalRequest, callback) {
    //console.log("### body " + util.inspect(originalRequest));
    if (originalRequest.method !== "POST") {
        callback(undefined);

    } else {
        var sendPost = [];
        originalRequest.on('data', function (chunk) {
            sendPost.push(chunk);
        });

        originalRequest.on('end', function () {
            var buffer = Buffer.concat(sendPost);
            //console.log("post data " + buffer);
            callback(buffer);
        });
    }
}

export function logRequest(sendRequestInfo, responseInfo, logger) {
    if (typeof logger.logRequest === "function") {
        logger.logRequest(sendRequestInfo, responseInfo);

    } else {
        logger.log("for " + getUrlString(sendRequestInfo));
        logger.log("send  " + util.inspect(sendRequestInfo));
        logger.log("response  " + util.inspect(responseInfo));
    }
}

export function getUrlString(requestInfo) {
    var scheme = requestInfo.port == 443 ? "https://" : "http://";
    return scheme + requestInfo.options.host + (requestInfo.options.path ? requestInfo.options.path : "");
}
