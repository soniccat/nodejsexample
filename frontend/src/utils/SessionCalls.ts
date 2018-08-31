import buildApiCall, { ApiCall, ApiParameters } from 'Utils/buildApiCall';
import SessionInfo from 'Model/SessionInfo';

export function buildSessionCall() : ApiCall {
  return buildApiCall({
    method: 'GET',
    path: 'session',
  });
}
