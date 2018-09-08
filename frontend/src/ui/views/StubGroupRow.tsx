import * as React from 'react';
import StubGroup from 'Model/StubGroup';
import Request from 'Model/Request';
import RequestRow from 'UI/views/RequestRow';
import ExpandButton from '../common/ExpandButton';
import 'CSS/StubGroupRow';

export interface StubGroupRowProps {
  stubGroup: StubGroup;
  isExpanded: boolean;
  isActive: boolean;

  onStubGroupStartClicked: (stubGroup: StubGroup) => void;
  onStubGroupStopClicked: (stubGroup: StubGroup) => void;
  onStubGroupDeleteClicked: (stubGroup: StubGroup) => void;
  onRequestChanged: (request: Request, stubGroup: StubGroup) => void;
  onRequestDeleteClicked: (request: Request, stubGroup: StubGroup) => void;
}

export interface StubGroupRowState {
  isExpanded: boolean;
}

export class StubGroupRow extends React.Component<StubGroupRowProps, StubGroupRowState> {
  constructor(props: StubGroupRowProps) {
    super(props);

    this.onRequestChanged = this.onRequestChanged.bind(this);
    this.onRequestDeleteClicked = this.onRequestDeleteClicked.bind(this);
    this.onToggleStatusClicked = this.onToggleStatusClicked.bind(this);
    this.onStubGroupHeaderPressed = this.onStubGroupHeaderPressed.bind(this);
    this.onStubGroupDeleteClicked = this.onStubGroupDeleteClicked.bind(this);

    this.state = {
      isExpanded: props.isExpanded,
    };
  }

  onToggleStatusClicked(e: React.MouseEvent<Element>) {
    e.stopPropagation();
    if (this.props.isActive) {
      this.props.onStubGroupStopClicked(this.props.stubGroup);
    } else {
      this.props.onStubGroupStartClicked(this.props.stubGroup);
    }
  }

  onStubGroupDeleteClicked(e: React.MouseEvent<Element>) {
    e.stopPropagation();
    this.props.onStubGroupDeleteClicked(this.props.stubGroup);
  }

  onRequestChanged(request: Request) {
    this.props.onRequestChanged(request, this.props.stubGroup);
  }

  onRequestDeleteClicked(request: Request) {
    this.props.onRequestDeleteClicked(request, this.props.stubGroup);
  }

  onStubGroupHeaderPressed() {
    this.setState({
      isExpanded: !this.state.isExpanded,
    });
  }

  render() {
    return <div className="stub_group_row">
      <div className="stub_group_header" onClick={this.onStubGroupHeaderPressed}>
        <ExpandButton className="stub_group_expand_mark" isExpanded={this.state.isExpanded}/>
        <div className="stub_group_name">
          {this.props.stubGroup.name}
        </div>
        <div className="stub_group_status" onClick={this.onToggleStatusClicked}>
          {this.props.isActive ? 'STOP' : 'START'}
        </div>
        <div className="stub_group_delete_button" onClick={this.onStubGroupDeleteClicked}>
          DEL
        </div>
      </div>
      {this.state.isExpanded ? this.renderExtra() : undefined }
    </div>;
  }

  renderExtra() {
    return <div className="stub_group_extra">
      {this.renderRequests(this.props.stubGroup.requests)}
    </div>;
  }

  renderRequests(requests: Request[]) {
    const rows = requests.map(row => (<RequestRow
      key={row.id}
      request={row}
      isExpanded={false}
      onRequestChanged={this.onRequestChanged}
      onDeleteClicked={this.onRequestDeleteClicked}
    />));

    return (
      <div>
        {rows}
      </div>
    );
  }
}

export default StubGroupRow;
