import StubGroup from 'Model/StubGroup';
import * as React from 'react';
import Request from 'Model/Request';
import loadCommand from 'Utils/loadCommand';
import { buildUpdateRequestCall, buildDeleteRequestCall } from 'Utils/RequestCalls';
import { buildStubGroupsCall } from 'Utils/StubGroupCalls';
import { StubGroupRow } from 'Components/StubGroupRow';

export interface StubGroupViewerProps {
  rows?: StubGroup[];
  error?: object;
}

export interface StubGroupViewerState {
  rows?: StubGroup[];
  error?: object;
}

export class StubGroupViewer extends React.Component<StubGroupViewerProps, StubGroupViewerState> {
  static defaultProps = {
    rows: [],
    error: undefined,
  };

  constructor(props: StubGroupViewerProps) {
    super(props);

    this.onRequestChanged = this.onRequestChanged.bind(this);
    this.onRequestDeleteClicked = this.onRequestDeleteClicked.bind(this);

    this.state = {
      rows: this.props.rows,
    };
  }

  // Events

  componentDidMount() {
    this.loadStubGroups();
  }

  onRequestChanged(request: Request, group: StubGroup) {
    // Actions
    // loadCommand(buildUpdateRequestCall(request), (err, response) => {
    //   if (err) {
    //     this.setState({
    //       error: err,
    //     });
    //   }
    // });
  }

  onRequestDeleteClicked(request: Request, group: StubGroup) {
    // loadCommand(buildDeleteRequestCall(request.id), (err, response) => {
    //   if (err) {
    //     this.setState({
    //       error: err,
    //     });
    //   } else {
    //     // remove request from stub
    //     // this.setState({
    //     //   rows: this.state.rows.filter((element: Request, index, array) => {
    //     //     return element.id !== row.id;
    //     //   }),
    //     // });
    //   }
    // });
  }

  loadStubGroups() {
    // const call = buildStubGroupsCall();

    // loadCommand(call, (err, response) => {
    //   if (err) {
    //     this.setState({
    //       error: err,
    //     });
    //   } else {
    //     this.setState({
    //       rows: response.data,
    //     });
    //   }
    // });
  }

  render() {
    const rows = this.state.rows.map(row => (<StubGroupRow
      key={row.id}
      stubGroup={row}
      isExpanded={false}
      onRequestChanged={this.onRequestChanged}
      onRequestDeleteClicked={this.onRequestDeleteClicked}/>));
    return (
      <div>
        {rows}
      </div>
    );
  }
}
