
var server = 'http://localhost:' + 7777 + '/__api__/';

function buildApiOptions(options) {
    var resultOptions = {
        headers: {'Content-Type': 'application/json'},
        method: options.method,
        url: server + options.path,
        data: options.data
    };

    return resultOptions;
}

export default buildApiOptions;