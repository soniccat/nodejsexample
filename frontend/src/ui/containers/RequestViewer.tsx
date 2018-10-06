import { LoadRequestsOption } from 'Model/LoadRequestsOption';
import * as React from 'react';
import RequestRow from 'UI/views/RequestRow';
import Request from 'Model/Request';
import DataHolder from 'Data/DataHolder';
import { StubGroupList } from 'UI/containers/StubGroupList';
import { RequestRowRefDictType } from 'Utils/types';
import { ensureRef } from 'Utils/RefTools';
import HistoryHolder from 'Data/HistoryHolder';

export interface RequestViewerProps {
  requestOptions?: LoadRequestsOption;
  dataHolder: DataHolder;
  historyHolder: HistoryHolder;
}

export interface RequestViewerState {
  requestOptions?: LoadRequestsOption;
}

export class RequestViewer extends React.Component<RequestViewerProps, RequestViewerState> {
  static defaultProps = {
    requestOptions: {
      urlRegexp: '.*v4.*',
    },
  };

  rowRefs: RequestRowRefDictType = {};

  constructor(props: RequestViewerProps) {
    super(props);

    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onCreateStubClicked = this.onCreateStubClicked.bind(this);
    this.onRequestChanged = this.onRequestChanged.bind(this);
    this.onRequestDeleteClicked = this.onRequestDeleteClicked.bind(this);
    this.onRunRequestClicked = this.onRunRequestClicked.bind(this);
    this.handleWillStartNameEditing = this.handleWillStartNameEditing.bind(this);

    this.state = {
      requestOptions: this.props.requestOptions,
    };
  }

  // Events

  componentDidMount() {
    this.props.dataHolder.loadRequests(this.state.requestOptions);
  }

  private onSearchChanged(event) {
    this.setState({ requestOptions: { urlRegexp: event.target.value } }, () => {
      console.log(`regexp ${this.state.requestOptions.urlRegexp}`);
      this.props.dataHolder.loadRequests(this.state.requestOptions);
    });
  }

  private onCreateStubClicked(row: Request) {
    this.props.dataHolder.createStub(row);
  }

  private onRequestChanged(row: Request) {
    this.props.dataHolder.updateRequest(row);
  }

  private onRequestDeleteClicked(row: Request) {
    this.props.dataHolder.deleteRequest(row);
  }

  private onRunRequestClicked(request: Request) {
    this.props.historyHolder.runRequest(request);
  }

  private handleWillStartNameEditing() {
    Object.keys(this.rowRefs).forEach((k) => {
      this.rowRefs[k].current.stopEditing();
    });
  }

  // Getters

  private getRenderRequests() {
    return this.props.dataHolder.requests ? this.props.dataHolder.requests : [];
  }

  // Render

  render() {
    const newRefs: RequestRowRefDictType = {};
    const requests = this.getRenderRequests();
    const rows = requests.map(request => (<RequestRow
      key={request.id}
      request={request}
      isExpanded={false}
      onCreateStubClicked={this.onCreateStubClicked}
      onRequestChanged={this.onRequestChanged}
      onDeleteClicked={this.onRequestDeleteClicked}
      onRunClicked={this.onRunRequestClicked}
      onStartNameEditing={this.handleWillStartNameEditing}
      stubGroupPopupContent={<StubGroupList dataHolder={this.props.dataHolder} request={request}/>}
      ref={ensureRef(request.id, this.rowRefs, newRefs)}
    />));

    this.rowRefs = newRefs;

    return (
      <div>
        <input
          id="searchField"
          type="text"
          value={this.state.requestOptions.urlRegexp}
          onChange={this.onSearchChanged}
        />
        {rows}
      </div>
    );
  }
}
