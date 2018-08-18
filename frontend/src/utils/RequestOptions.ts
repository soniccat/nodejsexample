import buildApiOptions, { ApiOptions, ApiParameters } from 'Utils/buildApiOptions';
import { Request, RequestWithoutId } from 'Model/Request';

export function buildRequestsOptions(options: object) : ApiOptions {
  return buildApiOptions({
    method: 'POST',
    path: 'requests',
    data: options,
  });
}

export function buildCreateRequestOptions(obj: RequestWithoutId) : ApiOptions {
  return buildApiOptions({
    method: 'POST',
    path: 'request',
    data: obj,
  });
}

export function buildUpdateRequestOptions(obj: Request) : ApiOptions {
  return buildApiOptions({
    method: 'POST',
    path: 'request/' + obj.id,
    data: obj,
  });
}

export function buildDeleteRequestOptions(id: number) : ApiOptions {
  return buildApiOptions({
    method: 'DELETE',
    path: 'request/' + id,
  });
}
