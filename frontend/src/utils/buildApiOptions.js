
const server = 'http://' + BACKEND_IP + ':' + BACKEND_PORT + '/' + BACKEND_PATH + '/';

function buildApiOptions(options) {
  const resultOptions = {
    headers: { 'Content-Type': 'application/json' },
    method: options.method,
    url: server + options.path,
    data: options.data,
  };

  return resultOptions;
}

export default buildApiOptions;
