
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
}

export default handleRequestResponse;