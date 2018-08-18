import * as axios from 'axios';
import { ApiCall } from 'Utils/buildApiCall';

export default function loadRequest(options: ApiCall, callback:(error: axios.AxiosError, response: axios.AxiosResponse) => void) {
  axios.default(options).then((response) => {
    callback(undefined, response);
  }).catch((error) => {
    callback(error, undefined);
  });
}
