import StubGroup from 'Model/StubGroup';
import * as React from 'react';
import RequestRow from 'Elements/RequestRow';
import { Request } from 'Model/Request';
import loadRequest from 'Utils/loadRequest';
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

  onRequestChanged(row: Request) {
    // Actions
    loadRequest(buildUpdateRequestCall(row), (err, response) => {
      if (err) {
        this.setState({
          error: err,
        });
      }
    });
  }

  onRequestDeleteClicked(row: Request) {
    loadRequest(buildDeleteRequestCall(row.id), (err, response) => {
      if (err) {
        this.setState({
          error: err,
        });
      } else {
        // this.setState({
        //   rows: this.state.rows.filter((element: Request, index, array) => {
        //     return element.id !== row.id;
        //   }),
        // });
      }
    });
  }

  loadStubGroups() {
    const call = buildStubGroupsCall();

    loadRequest(call, (err, response) => {
      if (err) {
        this.setState({
          error: err,
        });
      } else {
        this.setState({
          rows: response.data,
        });
      }
    });
  }

  render() {
    const rows = this.state.rows.map(row => (<StubGroupRow
      key={row.id}
      stubGroup={row}
      isExpanded={false}>
        {this.renderRequests(row.requests)}
      </StubGroupRow>));

    return (
      <div>
        {rows}
      </div>
    );
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
