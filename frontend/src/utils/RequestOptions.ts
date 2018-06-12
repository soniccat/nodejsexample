import buildApiOptions, { ApiOptions, ApiParameters } from 'Utils/buildApiOptions';

export function buildRequestsOptions(options: object) : ApiOptions {
  return buildApiOptions({
    method: 'post',
    path: 'requests',
    data: options,
  });
}

export function buildCreateRequestOptions(obj: object) : ApiOptions {
  return buildApiOptions({
    method: 'post',
    path: 'request',
    data: obj,
  });
}
