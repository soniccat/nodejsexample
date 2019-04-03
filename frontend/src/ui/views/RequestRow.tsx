import * as React from 'react';
import JsonView from 'UI/common/JsonView';
import InputView from 'UI/common/InputView';
import Request from 'Model/Request';
import { isObject } from 'Utils/Tools';
import ExpandButton from 'UI/common/ExpandButton';
import 'CSS/RequestRow';
import Popup from 'reactjs-popup';
import { InputViewRef } from 'Utils/types';

export interface RequestRowProps {
  request: Request;
  isExpanded: boolean;
  onCreateStubClicked?: (request: Request) => void;
  onRequestChanged: (request: Request) => void;
  onDeleteClicked: (request: Request) => void;
  onRunClicked: (request: Request) => void;
  onStartNameEditing: (request: Request) => void;
  onExpandedChanged?: (isExanded: boolean) => void;
  stubGroupPopupContent?: JSX.Element;
}

export interface RequestRowState {
  isExpanded: boolean;
  isSentExpanded: boolean;
  isReceivedExpanded: boolean;
}

export class RequestRow extends React.Component<RequestRowProps, RequestRowState> {
  inputViewRef?: InputViewRef;

  constructor(props: RequestRowProps) {
    super(props);

    this.onRequestShortClicked = this.onRequestShortClicked.bind(this);
    this.onSentShortClicked = this.onSentShortClicked.bind(this);
    this.onReceivedShortClicked = this.onReceivedShortClicked.bind(this);
    this.onCreateStubClicked = this.onCreateStubClicked.bind(this);
    this.onDeleteClicked = this.onDeleteClicked.bind(this);
    this.onRunClicked = this.onRunClicked.bind(this);
    this.onObjChanged = this.onObjChanged.bind(this);
    this.onStartNameEditing = this.onStartNameEditing.bind(this);
    this.onNameChanged = this.onNameChanged.bind(this);
    this.isExpandedValue = this.isExpandedValue.bind(this);

    this.inputViewRef = React.createRef<InputView>();

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
          {this.renderExpandedMark('request_expand_mark', this.isExpandedValue())}

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
          {(this.props.request.isStub && this.props.stubGroupPopupContent != null) ? this.renderStubGroupsButton() : undefined}
          <InputView className="request_name"
          value={this.props.request.name}
          emptyValue="Set Name"
          onEditingStarted = {this.onStartNameEditing}
          onValueChanged = {this.onNameChanged}
          ref={this.inputViewRef}/>
          <div className="request_run_button" onClick={this.onRunClicked}>
            Run
          </div>
        </div>
        {this.isExpandedValue() ? this.renderExtra() : undefined}
      </div>
    );
  }

  onStartNameEditing() {
    this.props.onStartNameEditing(this.props.request);
  }

  onNameChanged(name: string) {
    this.onObjChanged(Object.assign({}, this.props.request, { name }));
  }

  stopEditing() {
    if (this.inputViewRef.current) {
      this.inputViewRef.current.stopEditing();
    }
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
        {this.props.stubGroupPopupContent}
      </Popup>
    </span>;
  }

  renderExpandedMark(className, isExpanded) {
    return <ExpandButton className={className} isExpanded={isExpanded}/>;
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
              {this.renderJsonView(this.props.request.headers, 'headers')}
            </div>
            <div className="request_body">
              <div>Body</div>
              {this.renderBodyContent(this.props.request.body, 'body')}
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
              {this.renderJsonView(this.props.request.responseHeaders, 'responseHeaders')}
              </div> : undefined}
            {this.props.request.responseBody ? <div className="request_body">
              <div>Body</div>
              {this.renderBodyContent(this.props.request.responseBody, 'responseBody')}
              </div> : undefined}
          </div> : undefined}
      </div>
    </div>);
  }

  renderBodyContent(body: any, keyName: string) {
    if (isObject(body)) {
      return this.renderJsonView(body, keyName);
    }

    if (body) {
      return <div>{body}</div>;
    }
    return undefined;
  }

  renderJsonView(obj: any, keyName: string) {
    return <JsonView obj={obj}
      isEditable={true}
      expandLevel={3}
      onObjChanged={obj => this.onObjChanged(Object.assign({}, this.props.request, { [keyName]: obj }))}
      onCollapsedPressed={(key) => {}}/>;
  }

  onObjChanged(obj: Request) {
    this.props.onRequestChanged(obj);
  }

  onRequestShortClicked() {
    const newValue = !this.isExpandedValue();
    if (this.props.onExpandedChanged) {
      this.props.onExpandedChanged(newValue);
    } else {
      this.setState({
        isExpanded: newValue,
      });
    }
  }

  isExpandedValue() {
    return this.props.onExpandedChanged ? this.props.isExpanded : this.state.isExpanded;
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

  onRunClicked(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    this.props.onRunClicked(this.props.request);
  }
}

export default RequestRow;
