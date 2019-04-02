import * as axios from 'axios';
import { ApiCall } from 'Utils/buildApiCall';

export default async function loadCommand(options: ApiCall): Promise<axios.AxiosResponse> {
  return axios.default(options);
}

// export function loadCommandOld(options: ApiCall, callback:(error: axios.AxiosError, response: axios.AxiosResponse) => void) {
//   loadCommandPromise(options).then((response) => {
//     callback(undefined, response);
//   }).catch((error) => {
//     callback(error, undefined);
//   });
// }
