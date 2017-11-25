import React from 'react';
import PropTypes from 'prop-types';
import {requestMethodToString} from 'Utils/requestFormatter'
import JsonView from 'Elements/JsonView'
import {isObject} from "Utils/Tools"

import style from "CSS/RequestRow"

class RequestRow extends React.Component {
    constructor(props) {
        super(props);

        this.onClicked = this.onClicked.bind(this);

        this.state = {
            isExpanded: false,
            url: props.url,
            method: props.method,
            header: props.header,
            body: props.body,
            responseStatus: props.responseStatus}
    }

    render() {
        return (
            <div className="request_row">
                <div className="request_short" onClick={this.onClicked}>
                    <div className="request_method">
                        {requestMethodToString(this.state.method)}
                    </div>
                    <div className="request_url">
                        {this.state.url}
                    </div>
                    <div className="request_response_status">
                        {this.state.responseStatus}
                    </div>
                </div>
                {this.state.isExpanded ? this.renderExtra() : undefined}
            </div>
        );
    }

    renderExtra() {
        return <div className="request_row_extra">
            <div className="request_header">
                <JsonView obj={this.state.header}/>
            </div>
            <div className="request_body">
                {this.renderBodyContent()}
            </div>
        </div>;
    }

    renderBodyContent() {
        if (isObject(this.state.body)) {
            return <JsonView obj={this.state.body}/>
        } else if (this.state.body) {
            return <div>{this.state.body}</div>
        } else {
            return undefined;
        }
    }

    onClicked() {
        this.setState({
            isExpanded: !this.state.isExpanded
        })
    }
}

RequestRow.propTypes = {
    isExpanded: PropTypes.bool,
    url: PropTypes.string.isRequired,
    method: PropTypes.number,
    header: PropTypes.object,
    body: PropTypes.any,
    responseStatus: PropTypes.number
};

export default RequestRow;