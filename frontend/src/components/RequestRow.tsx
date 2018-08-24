import * as React from 'react';
import JsonView from 'Elements/JsonView';
import Request from 'Model/Request';
import { isObject } from 'Utils/Tools';
import ExpandButton from 'Elements/ExpandButton';
import Popup from 'reactjs-popup';
import 'CSS/RequestRow';

export interface RequestRowProps {
  request: Request;
  isExpanded: boolean;
  onCreateStubClicked?: (request: Request) => void;
  onRequestChanged: (request: Request) => void;
  onDeleteClicked: (request: Request) => void;
}

export interface RequestRowState {
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
    this.onDeleteClicked = this.onDeleteClicked.bind(this);
    this.onObjChanged = this.onObjChanged.bind(this);

    this.state = {
      isExpanded: props.isExpanded,
      isSentExpanded: true,
      isReceivedExpanded: true,
    };
  }

  render() {
    return (
      <div className="request_row">
        <div className="request_short" onClick={this.onRequestShortClicked}>
          {this.renderExpandedMark('request_expand_mark', this.state.isExpanded)}

          <div className="request_method">
            {this.props.request.method}
          </div>
          <div className="request_url">
            {this.props.request.url}
          </div>
          <div className="request_response_status">
            {this.props.request.responseStatus}
          </div>
          {!this.props.request.isStub ?
            <div className="request_create_stub_button" onClick={this.onCreateStubClicked}>
                            Create stub
            </div> : undefined}
          <div className="request_delete_button" onClick={this.onDeleteClicked}>
            DEL
          </div>
          {this.props.request.isStub ? this.renderStubGroupsButton() : undefined}
        </div>
        {this.state.isExpanded ? this.renderExtra() : undefined}
      </div>
    );
  }

  renderExpandedMark(className, isExpanded) {
    return <ExpandButton className={className} isExpanded={isExpanded}/>;
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
        <span> popup content </span>
      </Popup>
    </span>;
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
              {this.renderJsonView(this.props.request.headers)}
            </div>
            <div className="request_body">
              <div>Body</div>
              {this.renderBodyContent(this.props.request.body)}
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
            {this.props.request.responseHeaders ? <div className="request_headers">
              <div>Headers</div>
              {this.renderJsonView(this.props.request.responseHeaders)}
              </div> : undefined}
            {this.props.request.responseBody ? <div className="request_body">
              <div>Body</div>
              {this.renderBodyContent(this.props.request.responseBody)}
              </div> : undefined}
          </div> : undefined}
      </div>
    </div>);
  }

  renderBodyContent(body) {
    if (isObject(body)) {
      return this.renderJsonView(body);
    }

    if (body) {
      return <div>{body}</div>;
    }
    return undefined;
  }

  renderJsonView(obj: any) {
    return <JsonView obj={obj}
      isEditable={true}
      expandLevel={3}
      onObjChanged={this.onObjChanged}
      onCollapsedPressed={(key) => {}}/>;
  }

  onObjChanged(obj: any) {
    this.props.onRequestChanged(this.props.request);
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

  onCreateStubClicked(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    this.props.onCreateStubClicked(this.props.request);
  }

  onDeleteClicked(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    this.props.onDeleteClicked(this.props.request);
  }
}

export default RequestRow;
