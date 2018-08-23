import * as React from 'react';
import StubGroup from 'Model/StubGroup';
import { Request } from 'Model/Request';
import RequestRow from 'Elements/RequestRow';
import ExpandButton from 'Elements/ExpandButton';
import 'CSS/StubGroupRow';

export interface StubGroupRowProps {
  stubGroup: StubGroup;
  isExpanded: boolean;

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
    this.onStubGroupHeaderPressed = this.onStubGroupHeaderPressed.bind(this);

    this.state = {
      isExpanded: props.isExpanded,
    };
  }

  onRequestChanged(request: Request) {
    this.props.onRequestChanged(request, this.props.stubGroup);
  }

  onRequestDeleteClicked(request: Request) {
    this.props.onRequestDeleteClicked(request, this.props.stubGroup);
  }

  render() {
    return <div className="stub_group_row">
      <div className="stub_group_header" onClick={this.onStubGroupHeaderPressed}>
        <ExpandButton className="stub_group_expand_mark" isExpanded={this.state.isExpanded}/>
        <div className="stub_group_name">
          {this.props.stubGroup.name}
        </div>
      </div>
      {this.state.isExpanded ? this.renderExtra() : undefined }
    </div>;
  }

  onStubGroupHeaderPressed() {
    this.setState({
      isExpanded: !this.state.isExpanded,
    });
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
