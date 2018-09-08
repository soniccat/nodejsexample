import SessionInfo from 'Model/SessionInfo';
import { buildSessionCall, buildAddStubGroupCall, buildRemoveStubGroupCall } from 'Utils/SessionCalls';
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

  start(stubGroupIds: number[]) {
    const call = buildAddStubGroupCall(stubGroupIds);

    return loadCommand(call).then((response) => {
      this.sessionInfo = response.data;
      this.onDataUpdated();
      return response.data;
    });
  }

  stop(stubGroupIds: number[]) {
    const call = buildRemoveStubGroupCall(stubGroupIds);

    return loadCommand(call).then((response) => {
      this.sessionInfo = response.data;
      this.onDataUpdated();
      return response.data;
    });
  }
}
