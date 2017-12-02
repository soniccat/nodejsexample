
function handleRequestResponse(callback) {
    return function(err, response) {
        if (err == undefined) {
            normalizeRequestListResponse(response)
        }

        callback(err, response);
    }
}

function normalizeRequestListResponse(response) {
    for (var i = 0; i < response.data.length; ++i) {
        normalizeRequestResponse(response.data[i]);
    }
}

function normalizeRequestResponse(request) {
    request.method = parseInt(request.method);
    request.header = JSON.parse(request.header);
    request.responseStatus = parseInt(request.response_status);

    var body = undefined;
    if (request.body_json) {
        body = JSON.parse(request.body_json);
    } else if (request.body_string) {
        body = request.body_string;
    }

    if (body) {
        request.body = body;
    }

    request.responseHeader = JSON.parse(request.response_header);

    var responseBody = undefined;
    if (request.response_json) {
        responseBody = JSON.parse(request.response_json);
    } else if (request.response_string) {
        responseBody = request.response_string;
    }

    if (responseBody) {
        request.responseBody = responseBody;
    }

}

export default handleRequestResponse;