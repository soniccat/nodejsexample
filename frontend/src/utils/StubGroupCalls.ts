import buildApiCall, { ApiCall, ApiParameters } from 'Utils/buildApiCall';
import Request from 'Model/Request';
import StubGroup from 'Model/StubGroup';

export function buildStubGroupsCall() : ApiCall {
  return buildApiCall({
    method: 'GET',
    path: 'stubgroups',
  });
}

export function buildAddRequestCall(stubGroupId: number, requestId: number) : ApiCall {
  return buildApiCall({
    method: 'POST',
    path: `stubgroups/${stubGroupId}/requests/${requestId}`,
    data: {},
  });
}
