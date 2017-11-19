import axios from 'axios'

function loadRequest(options, callback) {
    axios(options).then(function (response) {
        callback(undefined, response);

    }).catch(function (error) {
        callback(error, undefined);
    });
}

export default loadRequest;