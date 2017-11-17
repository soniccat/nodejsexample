import React from 'react';
import PropTypes from 'prop-types';
import RequestRow from 'Elements/RequestRow';
import RequestStorage from 'Utils/RequestStorage'

class RequestViewer extends React.Component {
    constructor(props) {
        super(props);
        this.requestStorage = new RequestStorage();
        this.state = {fields: ["url"]}
    }

    componentDidMount() {
        this.loadRequests()
    }

    loadRequests() {
        this.requestStorage.loadRequests(function (err, rows) {
            console.log("requests are loaded");
        })
    }

    render() {
        return (
            <div>
                <RequestRow url={"test"}/>
            </div>
        );
    }
}

RequestViewer.propTypes = {
};


export default RequestViewer;