import * as axios from 'axios';
import { ApiOptions } from 'main/utils/buildApiOptions';

export default function loadRequest(options: ApiOptions, callback:(error: axios.AxiosError, response: axios.AxiosResponse)=>void) {
  axios.default(options).then((response) => {
    callback(undefined, response);
  }).catch((error) => {
    callback(error, undefined);
  });
}