import axios from 'axios';

function loadRequest(options, callback) {
  axios(options).then((response) => {
    callback(undefined, response);
  }).catch((error) => {
    callback(error, undefined);
  });
}

export default loadRequest;
