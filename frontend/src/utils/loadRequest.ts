import axios from 'axios';

export default function loadRequest(options, callback) {
  axios(options).then((response) => {
    callback(undefined, response);
  }).catch((error) => {
    callback(error, undefined);
  });
}