export function requestMethodToString(method) {
    switch (method) {
        case 1: return "GET";
        case 2: return "POST";
        default: return "UNKNOWN"
    }
}