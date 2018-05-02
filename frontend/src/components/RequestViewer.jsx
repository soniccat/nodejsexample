import React from 'react';
import PropTypes from 'prop-types';
import RequestRow from 'Elements/RequestRow';
import loadRequest from 'Utils/loadRequest';
import { buildRequestsOptions, buildCreateRequestOptions } from 'Utils/RequestOptions';

class RequestViewer extends React.Component {
  constructor(props) {
    super(props);

    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onCreateStubClicked = this.onCreateStubClicked.bind(this);
    console.dir('constructor');

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
    this.setState({ requestOptions: { urlRegexp: event.target.value } }, (prevState, props) => {
      console.log(`regexp ${this.state.requestOptions.urlRegexp}`);
      this.loadRequests();
    });
  }

  onCreateStubClicked(row) {
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
    console.dir(this.state.rows);
    const rows = this.state.rows.map(row => (<RequestRow
      key={row.id}
      url={row.url}
      port={row.port}
      method={row.method}
      headers={row.headers}
      body={row.body}
      responseStatus={row.responseStatus}
      responseHeaders={row.responseHeaders}
      responseBody={row.responseBody}
      isStub={row.isStub}

      onCreateStubClicked={this.onCreateStubClicked}
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

RequestViewer.defaultProps = {
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

RequestViewer.propTypes = {
  requestOptions: PropTypes.object,
  rows: PropTypes.array,
  error: PropTypes.any,
};

export default RequestViewer;
