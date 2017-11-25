import React from 'react';
import PropTypes from 'prop-types';
import {requestMethodToString} from 'Utils/requestFormatter'
import JsonView from 'Elements/JsonView'
import style from "CSS/RequestRow"

class RequestRow extends React.Component {
    constructor(props) {
        super(props);

        this.onClicked = this.onClicked.bind(this);

        this.state = {
            isExpanded: false,
            url: props.url,
            method: props.method,
            header: props.header}
    }

    render() {
        return (
            <div className="request_row" onClick={this.onClicked}>
                <div className="request_method">
                    {requestMethodToString(this.state.method)}
                </div>
                <div className="request_url">
                    {this.state.url}
                </div>
                {this.state.isExpanded ? <div className="request_row_extra">
                    <JsonView obj={this.state.header}/>
                </div> : undefined}
            </div>
        );
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
    method: PropTypes.number.isRequired,
    header: PropTypes.object
};

export default RequestRow;