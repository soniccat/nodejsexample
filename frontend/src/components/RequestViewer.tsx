import { RequestOptions } from 'Model/RequestOptions';

import * as React from 'react';
import RequestRow from 'Elements/RequestRow';
import { Request } from 'Model/Request';
import loadRequest from 'Utils/loadRequest';
import { buildRequestsOptions, buildCreateRequestOptions, buildUpdateRequestOptions } from 'Utils/RequestOptions';

export interface RequestViewerProps {
  requestOptions?: RequestOptions;
  rows?: Request[];
  error?: object;
}

export interface RequestViewerState {
  requestOptions?: RequestOptions;
  rows?: Request[];
  error?: object;
}

export class RequestViewer extends React.Component<RequestViewerProps, RequestViewerState> {
  static defaultProps = {
    requestOptions: {
      fields: ['id', 'url', 'port', 'method',
        'headers', 'body_string', 'body_string_is_json',
        'response_status', 'response_headers', 'response_string', 'response_string_is_json',
        'is_stub'],
      urlRegexp: '.*v4.*',
      onlyNotNull: false,
    },
    rows: [],
    error: undefined,
  };

  constructor(props: RequestViewerProps) {
    super(props);

    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onCreateStubClicked = this.onCreateStubClicked.bind(this);
    this.onRequestChanged = this.onRequestChanged.bind(this);

    this.state = {
      requestOptions: this.props.requestOptions,
      rows: this.props.rows,
    };
  }

  // Events

  componentDidMount() {
    this.loadRequests();
  }

  onSearchChanged(event) {
    this.setState({ requestOptions: { urlRegexp: event.target.value } }, () => {
      console.log(`regexp ${this.state.requestOptions.urlRegexp}`);
      this.loadRequests();
    });
  }

  onCreateStubClicked(row: Request) {
    this.createStub(row);
  }

  onRequestChanged(row: Request) {
    // Actions
    loadRequest(buildUpdateRequestOptions(row), (err, response) => {
      if (err) {
        this.setState({
          error: err,
        });
      }
    });
  }

  private createStub(row: Request) {
    const options = buildCreateRequestOptions({
      url: row.url,
      port: row.port,
      method: row.method,
      headers: row.headers,
      body: row.body,
      responseStatus: row.responseStatus,
      responseHeaders: row.responseHeaders,
      responseBody: row.responseBody,
      isStub: true,
    });
    // Actions
    loadRequest(options, (err, response) => {
      if (err) {
        this.setState({
          error: err,
        });
      } else {
        this.setState({
          rows: [response.data].concat(this.state.rows),
        });
      }
    });
  }

  loadRequests() {
    const options = buildRequestsOptions(this.state.requestOptions);

    loadRequest(options, (err, response) => {
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
    // console.dir(this.state.rows);
    const rows = this.state.rows.map(row => (<RequestRow
      key={row.id}
      request={row}
      isExpanded={false}
      onCreateStubClicked={this.onCreateStubClicked}
      onRequestChanged={this.onRequestChanged}
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
}