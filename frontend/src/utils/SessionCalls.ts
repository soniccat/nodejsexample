import buildApiCall, { ApiCall, ApiParameters } from 'Utils/buildApiCall';
import SessionInfo from 'Model/SessionInfo';

export function buildSessionCall() : ApiCall {
  return buildApiCall({
    method: 'GET',
    path: 'session',
  });
}

export function buildAddStubGroupCall(ids: number[]) : ApiCall {
  return buildApiCall({
    method: 'PATCH',
    path: 'session',
    data: [{ op: 'add', path: '/stubGroupIds', values: ids }],
  });
}

export function buildRemoveStubGroupCall(ids: number[]) : ApiCall {
  return buildApiCall({
    method: 'PATCH',
    path: 'session',
    data: [{ op: 'remove', path: '/stubGroupIds', values: ids }],
  });
}
