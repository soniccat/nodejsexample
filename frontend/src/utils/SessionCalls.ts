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
    method: 'POST',
    path: 'session/stubgroups',
    data: {
      stubGroupIds: ids,
    },
  });
}

export function buildRemoveStubGroupCall(ids: number[]) : ApiCall {
  return buildApiCall({
    method: 'DELETE',
    path: 'session/stubgroups',
    data: {
      stubGroupIds: ids,
    },
  });
}
