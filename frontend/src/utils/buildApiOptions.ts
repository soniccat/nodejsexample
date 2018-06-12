
const server = 'http://' + BACKEND_IP + ':' + BACKEND_PORT + '/' + BACKEND_PATH + '/';

export interface ApiParameters {
  path: string;
  method: string;
  data: object;
}

export interface ApiOptions {
  headers: {[index: string]: string};
  method: string;
  url: string;
  data: object;
}

export function buildApiOptions(options: ApiParameters) : ApiOptions {
  const resultOptions = {
    headers: { 'Content-Type': 'application/json' },
    method: options.method,
    url: server + options.path,
    data: options.data,
  };

  return resultOptions;
}

export default buildApiOptions;