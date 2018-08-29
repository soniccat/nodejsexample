import StubGroup from 'Model/StubGroup';
import * as React from 'react';
import Request from 'Model/Request';
import { StubGroupRow } from 'UI/views/StubGroupRow';
import DataHolder from 'Data/DataHolder';
import { throws } from 'assert';

export interface StubGroupViewerProps {
  dataHolder: DataHolder;
}

export interface StubGroupViewerState {
}

export class StubGroupViewer extends React.Component<StubGroupViewerProps, StubGroupViewerState> {
  constructor(props: StubGroupViewerProps) {
    super(props);

    this.onRequestChanged = this.onRequestChanged.bind(this);
    this.onRequestDeleteClicked = this.onRequestDeleteClicked.bind(this);
    this.onStubGroupDeleteClicked = this.onStubGroupDeleteClicked.bind(this);

    this.state = {
    };
  }

  // Events

  componentDidMount() {
    this.loadStubGroups();
  }

  onStubGroupDeleteClicked(group: StubGroup) {
    this.props.dataHolder.deleteStubGroup(group.id);
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
    const stubGroups = this.props.dataHolder.stubGroups ? this.props.dataHolder.stubGroups : [];
    const rows = stubGroups.map(row => (<StubGroupRow
      key={row.id}
      stubGroup={row}
      isExpanded={false}
      onStubGroupDeleteClicked={this.onStubGroupDeleteClicked}
      onRequestChanged={this.onRequestChanged}
      onRequestDeleteClicked={this.onRequestDeleteClicked}/>));
    return (
      <div>
        {rows}
      </div>
    );
  }
}
