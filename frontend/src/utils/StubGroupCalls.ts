import buildApiCall, { ApiCall, ApiParameters } from 'Utils/buildApiCall';
import Request from 'Model/Request';
import StubGroup from 'Model/StubGroup';

export function buildStubGroupsCall() : ApiCall {
  return buildApiCall({
    method: 'GET',
    path: 'stubgroups',
  });
}
