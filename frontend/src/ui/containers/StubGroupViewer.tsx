import StubGroup from 'Model/StubGroup';
import * as React from 'react';
import Request from 'Model/Request';
import { StubGroupRow } from 'UI/views/StubGroupRow';
import DataHolder from 'Data/DataHolder';
import SessionHolder from 'Data/SessionHolder';
import { StubGroupRowRefDictType } from 'Utils/types';
import { ensureRef } from 'Utils/RefTools';

export interface StubGroupViewerProps {
  dataHolder: DataHolder;
  sessionHolder: SessionHolder;
}

export interface StubGroupViewerState {
}

export class StubGroupViewer extends React.Component<StubGroupViewerProps, StubGroupViewerState> {
  rowRefs: StubGroupRowRefDictType = {};

  constructor(props: StubGroupViewerProps) {
    super(props);

    this.onRequestChanged = this.onRequestChanged.bind(this);
    this.onRequestDeleteClicked = this.onRequestDeleteClicked.bind(this);
    this.onStubGroupDeleteClicked = this.onStubGroupDeleteClicked.bind(this);
    this.onStubGroupStartClicked = this.onStubGroupStartClicked.bind(this);
    this.onStubGroupStopClicked = this.onStubGroupStopClicked.bind(this);
    this.onStubGroupChanged = this.onStubGroupChanged.bind(this);
    this.onStubGroupStartNameEditing = this.onStubGroupStartNameEditing.bind(this);

    this.state = {
    };
  }

  // Events

  componentDidMount() {
    this.loadStubGroups();
  }

  onStubGroupStartClicked(group: StubGroup) {
    this.props.sessionHolder.start([group.id]);
  }

  onStubGroupStopClicked(group: StubGroup) {
    this.props.sessionHolder.stop([group.id]);
  }

  onStubGroupDeleteClicked(group: StubGroup) {
    this.props.dataHolder.deleteStubGroup(group.id);
  }

  onStubGroupChanged(group: StubGroup) {
    this.props.dataHolder.updateStubGroup(group);
  }

  onStubGroupStartNameEditing(group: StubGroup) {
    Object.keys(this.rowRefs).forEach((k) => {
      this.rowRefs[k].current.stopEditing();
    });
  }

  onRequestChanged(request: Request, group: StubGroup) {
    this.props.dataHolder.updateRequest(request);
  }

  onRequestDeleteClicked(request: Request, group: StubGroup) {
    this.props.dataHolder.deleteRequestFromStubGroup(group.id, request.id);
  }

  loadStubGroups() {
    this.props.dataHolder.loadStubGroups();
  }

  render() {
    const newRefs: StubGroupRowRefDictType = {};
    const stubGroups = this.props.dataHolder.stubGroups ? this.props.dataHolder.stubGroups : [];
    const rows = stubGroups.map(group => (<StubGroupRow
      key={group.id}
      stubGroup={group}
      isActive={this.props.sessionHolder.isStubGroupActive(group)}
      isExpanded={false}
      onStubGroupDeleteClicked={this.onStubGroupDeleteClicked}
      onStubGroupStartClicked={this.onStubGroupStartClicked}
      onStubGroupStopClicked={this.onStubGroupStopClicked}
      onStubGroupChanged={this.onStubGroupChanged}
      onStubGroupStartNameEditing={this.onStubGroupStartNameEditing}
      onRequestChanged={this.onRequestChanged}
      onRequestDeleteClicked={this.onRequestDeleteClicked}
      ref={ensureRef(group.id, this.rowRefs, newRefs)}
      />));

    this.rowRefs = newRefs;

    return (
      <div>
        {rows}
      </div>
    );
  }
}
