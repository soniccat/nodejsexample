import SessionInfo from 'Model/SessionInfo';
import { buildSessionCall } from 'Utils/SessionCalls';
import loadCommand from 'Utils/loadCommand';
import StubGroup from 'Model/StubGroup';

export default class SessionHolder {
  sessionInfo: SessionInfo;

  onDataUpdated() {
  }

  loadInfo() {
    const call = buildSessionCall();

    return loadCommand(call).then((response) => {
      this.sessionInfo = response.data;
      this.onDataUpdated();
      return response.data;
    });
  }

  isStubGroupActive(group: StubGroup): boolean {
    return this.sessionInfo != null && this.sessionInfo.stubGroupIds.find(o => o === group.id) != null;
  }
}
