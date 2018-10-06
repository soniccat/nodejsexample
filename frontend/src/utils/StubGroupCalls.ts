import buildApiCall, { ApiCall, ApiParameters } from 'Utils/buildApiCall';
import Request from 'Model/Request';
import StubGroup from 'Model/StubGroup';

export function buildStubGroupsCall() : ApiCall {
  return buildApiCall({
    method: 'GET',
    path: 'stubgroups',
  });
}

export function buildAddRequestToStubGroupCall(stubGroupId: number, requestId: number) : ApiCall {
  return buildApiCall({
    method: 'POST',
    path: `stubgroups/${stubGroupId}/requests/${requestId}`,
    data: {},
  });
}

export function buildDeleteRequestFromStubGroupCall(stubGroupId: number, requestId: number) : ApiCall {
  return buildApiCall({
    method: 'DELETE',
    path: `stubgroups/${stubGroupId}/requests/${requestId}`,
    data: {},
  });
}

export function buildCreateStubGroupCall(name: string): ApiCall {
  return buildApiCall({
    method: 'POST',
    path: `stubgroups`,
    data: { name },
  });
}

export function buildUpdateStubGroupCall(stubGroup: StubGroup): ApiCall {
  return buildApiCall({
    method: 'POST',
    path: `stubgroups/${stubGroup.id}`,
    data: stubGroup,
  });
}

export function buildDeleteStubGroupCall(id: number): ApiCall {
  return buildApiCall({
    method: 'DELETE',
    path: `stubgroups/${id}`,
  });
}
