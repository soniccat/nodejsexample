import buildApiOptions, { ApiOptions, ApiParameters } from 'Utils/buildApiOptions';
import { Request, RequestWithoutId } from 'Model/Request';

export function buildRequestsOptions(options: object) : ApiOptions {
  return buildApiOptions({
    method: 'post',
    path: 'requests',
    data: options,
  });
}

export function buildCreateRequestOptions(obj: RequestWithoutId) : ApiOptions {
  return buildApiOptions({
    method: 'post',
    path: 'request',
    data: obj,
  });
}

export function buildUpdateRequestOptions(obj: Request) : ApiOptions {
  return buildApiOptions({
    method: 'post',
    path: 'request',
    data: obj,
  });
}
