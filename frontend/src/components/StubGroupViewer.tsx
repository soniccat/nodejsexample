import StubGroup from 'Model/StubGroup';
import * as React from 'react';
import Request from 'Model/Request';
import { StubGroupRow } from 'Components/StubGroupRow';
import DataHolder from 'Data/DataHolder';

export interface StubGroupViewerProps {
  dataHolder: DataHolder;
}

export interface StubGroupViewerState {
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
    this.props.dataHolder.loadStubGroups();
  }

  render() {
    const stubGroups = this.props.dataHolder.stubGroups ? this.props.dataHolder.stubGroups : [];
    const rows = stubGroups.map(row => (<StubGroupRow
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
