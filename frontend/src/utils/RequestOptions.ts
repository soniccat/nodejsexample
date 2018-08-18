import buildApiCall, { ApiCall, ApiParameters } from 'Utils/buildApiCall';
import { Request } from 'Model/Request';

export function buildRequestsCall(options: object) : ApiCall {
  return buildApiCall({
    method: 'POST',
    path: 'requests',
    data: options,
  });
}

export function buildCreateRequestCall(obj: Request) : ApiCall {
  return buildApiCall({
    method: 'POST',
    path: 'request',
    data: obj,
  });
}

export function buildUpdateRequestCall(obj: Request) : ApiCall {
  return buildApiCall({
    method: 'POST',
    path: 'request/' + obj.id,
    data: obj,
  });
}

export function buildDeleteRequestCall(id: number) : ApiCall {
  return buildApiCall({
    method: 'DELETE',
    path: 'request/' + id,
  });
}
