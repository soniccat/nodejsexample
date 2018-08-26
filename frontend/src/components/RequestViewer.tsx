import { LoadRequestsOption } from 'Model/LoadRequestsOption';
import Popup from 'reactjs-popup';
import * as React from 'react';
import RequestRow from 'Components/RequestRow';
import Request from 'Model/Request';
import DataHolder from 'Data/DataHolder';

export interface RequestViewerProps {
  requestOptions?: LoadRequestsOption;
  dataHolder: DataHolder;
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

  constructor(props: RequestViewerProps) {
    super(props);

    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onCreateStubClicked = this.onCreateStubClicked.bind(this);
    this.onRequestChanged = this.onRequestChanged.bind(this);
    this.onRequestDeleteClicked = this.onRequestDeleteClicked.bind(this);

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

  render() {
    const requests = this.props.dataHolder.requests ? this.props.dataHolder.requests : [];
    const element = this.renderStubGroupsButton();
    const rows = requests.map(request => (<RequestRow
      key={request.id}
      request={request}
      isExpanded={false}
      onCreateStubClicked={this.onCreateStubClicked}
      onRequestChanged={this.onRequestChanged}
      onDeleteClicked={this.onRequestDeleteClicked}
      stubGroupElement={element}
    />));

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

  renderStubGroupsButton() {
    return <span onClick={(e: React.MouseEvent) => e.stopPropagation()}>
      <Popup
        trigger={open => (
          <div className="stub_group_add_button">Stub groups</div>
        )}
        closeOnDocumentClick={true}
        keepTooltipInside={true}
        >
        {this.renderStubGroups()}
      </Popup>
    </span>;
  }

  renderStubGroups() {
    return <div key={1}>test</div>;
  }
}
