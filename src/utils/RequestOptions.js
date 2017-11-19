import buildApiOptions from "Utils/buildApiOptions"

export function buildRequestOptions(options) {
    return buildApiOptions({
        method: 'post',
        path: "requests",
        data: options
    });
}
