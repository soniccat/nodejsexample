import React from 'react';
import PropTypes from 'prop-types';
import JsonView from 'Elements/JsonView'
import {isObject} from "Utils/Tools"

import style from "CSS/RequestRow"

class RequestRow extends React.Component {
    constructor(props) {
        super(props);

        this.onRequestShortClicked = this.onRequestShortClicked.bind(this);
        this.onSentShortClicked = this.onSentShortClicked.bind(this);
        this.onReceivedShortClicked = this.onReceivedShortClicked.bind(this);
        this.onCreateStubClicked = this.onCreateStubClicked.bind(this);

        this.state = {
            isExpanded: false,
            isSentExpanded: true,
            isReceivedExpanded: true,
            url: props.url,
            port: props.port,
            method: props.method,
            headers: props.headers,
            body: props.body,
            responseStatus: props.responseStatus,
            responseHeaders: props.responseHeaders,
            responseBody: props.responseBody,
            isStub: false
        }
    }

    render() {
        return (
            <div className="request_row">
                <div className="request_short" onClick={this.onRequestShortClicked}>
                    {this.renderExpandedMark("request_expand_mark", this.state.isExpanded)}

                    <div className="request_method">
                        {this.state.method}
                    </div>
                    <div className="request_url">
                        {this.state.url}
                    </div>
                    <div className="request_response_status">
                        {this.state.responseStatus}
                    </div>
                    {!this.state.isStub ?
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
        return <div className={className}>
            {isExpanded ? "-" : "+"}
        </div>
    }

    renderExtra() {
        return <div className="request_row_extra">
            <div className="request_sent_data">
                <div className="request_sent_short" onClick={this.onSentShortClicked}>
                    {this.renderExpandedMark("sent_expand_mark", this.state.isSentExpanded)}
                    <span>Sent</span>
                </div>

                {this.state.isSentExpanded ?
                    <div className="request_sent_extra">
                        <div className="request_headers">
                            <div>Headers</div>
                            <JsonView obj={this.state.headers}/>
                        </div>
                        <div className="request_body">
                            <div>Body</div>
                            {this.renderBodyContent(this.state.body)}
                        </div>
                    </div>: undefined}
            </div>

            <div className="request_received_data">
                <div className="request_received_short" onClick={this.onReceivedShortClicked}>
                    {this.renderExpandedMark("received_expand_mark", this.state.isReceivedExpanded)}
                    <span>Received</span>
                </div>

                {this.state.isReceivedExpanded ?
                    <div className="request_received_extra">
                        {this.state.responseHeaders ? <div className="request_headers">
                            <div>Headers</div>
                            <JsonView obj={this.state.responseHeaders}/>
                        </div> : undefined}
                        {this.state.responseBody ? <div className="request_body">
                            <div>Body</div>
                            {this.renderBodyContent(this.state.responseBody)}
                        </div> : undefined}
                    </div>: undefined}
            </div>
        </div>;
    }

    renderBodyContent(body) {
        if (isObject(body)) {
            return <JsonView obj={body}/>
        } else if (body) {
            return <div>{body}</div>
        } else {
            return undefined;
        }
    }

    onRequestShortClicked() {
        this.setState({
            isExpanded: !this.state.isExpanded
        })
    }

    onSentShortClicked() {
        this.setState({
            isSentExpanded: !this.state.isSentExpanded
        })
    }

    onReceivedShortClicked() {
        this.setState({
            isReceivedExpanded: !this.state.isReceivedExpanded
        })
    }

    onCreateStubClicked() {
        this.props.onCreateStubClicked(this.state);
    }
}

RequestRow.propTypes = {
    isExpanded: PropTypes.bool,
    url: PropTypes.string.isRequired,
    port: PropTypes.number,
    method: PropTypes.string,
    headers: PropTypes.object,
    body: PropTypes.any,
    responseStatus: PropTypes.number,
    responseHeaders: PropTypes.object,
    responseBody: PropTypes.any,
    isStub: PropTypes.bool,

    onCreateStubClicked: PropTypes.func
};

export default RequestRow;