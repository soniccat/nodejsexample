import * as React from 'react';
import JsonView from 'Elements/JsonView';
import Request from 'Model/Request';
import { isObject } from 'Utils/Tools';

//import style from 'CSS/RequestRow.scss';
require('CSS/RequestRow.scss');

export interface RequestRowProps { 
  request: Request;

  isExpanded: boolean;
  onCreateStubClicked: (request: Request) => void;
}

export interface RequestRowState {
  request: Request;

  isExpanded: boolean;
  isSentExpanded: boolean;
  isReceivedExpanded: boolean;
} 

export class RequestRow extends React.Component<RequestRowProps, RequestRowState> {
  constructor(props: RequestRowProps) {
    super(props);

    this.onRequestShortClicked = this.onRequestShortClicked.bind(this);
    this.onSentShortClicked = this.onSentShortClicked.bind(this);
    this.onReceivedShortClicked = this.onReceivedShortClicked.bind(this);
    this.onCreateStubClicked = this.onCreateStubClicked.bind(this);

    this.state = {
      isExpanded: props.isExpanded,
      isSentExpanded: true,
      isReceivedExpanded: true,
      request: props.request
    };
  }

  render() {
    return (
      <div className="request_row">
        <div className="request_short" onClick={this.onRequestShortClicked}>
          {this.renderExpandedMark('request_expand_mark', this.state.isExpanded)}

          <div className="request_method">
            {this.state.request.method}
          </div>
          <div className="request_url">
            {this.state.request.url}
          </div>
          <div className="request_response_status">
            {this.state.request.responseStatus}
          </div>
          {!this.state.request.isStub ?
            <div className="request_create_stub_button" onClick={this.onCreateStubClicked}>
                            Create stub
            </div> : undefined
                    }
        </div>
        {this.state.isExpanded ? this.renderExtra() : undefined}
      </div>
    );
  }

  renderExpandedMark(className, isExpanded) {
    return (<div className={className}>
      {isExpanded ? '-' : '+'}
            </div>);
  }

  renderExtra() {
    return (<div className="request_row_extra">
      <div className="request_sent_data">
        <div className="request_sent_short" onClick={this.onSentShortClicked}>
          {this.renderExpandedMark('sent_expand_mark', this.state.isSentExpanded)}
          <span>Sent</span>
        </div>

        {this.state.isSentExpanded ?
          <div className="request_sent_extra">
            <div className="request_headers">
              <div>Headers</div>
              <JsonView obj={this.state.request.headers} isEditable={true} />
            </div>
            <div className="request_body">
              <div>Body</div>
              {this.renderBodyContent(this.state.request.body)}
            </div>
          </div> : undefined}
      </div>

      <div className="request_received_data">
        <div className="request_received_short" onClick={this.onReceivedShortClicked}>
          {this.renderExpandedMark('received_expand_mark', this.state.isReceivedExpanded)}
          <span>Received</span>
        </div>

        {this.state.isReceivedExpanded ?
          <div className="request_received_extra">
            {this.state.request.responseHeaders ? <div className="request_headers">
              <div>Headers</div>
              <JsonView obj={this.state.request.responseHeaders} isEditable={true} />
            </div> : undefined}
            {this.state.request.responseBody ? <div className="request_body">
              <div>Body</div>
              {this.renderBodyContent(this.state.request.responseBody)}
                                       </div> : undefined}
          </div> : undefined}
      </div>
            </div>);
  }

  renderBodyContent(body) {
    if (isObject(body)) {
      return <JsonView obj={body} isEditable={true} />;
    } else if (body) {
      return <div>{body}</div>;
    }
    return undefined;
  }

  onRequestShortClicked() {
    this.setState({
      isExpanded: !this.state.isExpanded,
    });
  }

  onSentShortClicked() {
    this.setState({
      isSentExpanded: !this.state.isSentExpanded,
    });
  }

  onReceivedShortClicked() {
    this.setState({
      isReceivedExpanded: !this.state.isReceivedExpanded,
    });
  }

  onCreateStubClicked() {
    this.props.onCreateStubClicked(this.state.request);
  }
}

export default RequestRow;
