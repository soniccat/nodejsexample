import buildApiOptions from "Utils/buildApiOptions"

export function buildRequestsOptions(options) {
    return buildApiOptions({
        method: 'post',
        path: "requests",
        data: options
    });
}

export function buildCreateRequestOptions(obj) {
    return buildApiOptions({
        method: 'post',
        path: "request",
        data: obj
    });
}