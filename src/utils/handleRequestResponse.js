
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
}

export default handleRequestResponse;