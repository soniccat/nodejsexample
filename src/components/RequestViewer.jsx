import React from 'react';
import PropTypes from 'prop-types';
import RequestRow from 'Elements/RequestRow';
import loadRequest from 'Utils/loadRequest'
import {buildRequestOptions} from 'Utils/RequestOptions';

class RequestViewer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {requestOptions: {
                                fields: ["id", "url", "body_json"],
                                urlRegexp: ".*v4.*",
                                onlyNotNull: true
                            },
                      rows: [],
                      error: undefined
        };
        console.dir("constructor");
    }

    componentDidMount() {
        this.loadRequests()
    }

    loadRequests() {
        let options = buildRequestOptions(this.state.requestOptions);

        let that = this;
        loadRequest(options, function (err, response) {
            if (err != undefined) {
                that.setState({
                    error: err
                })
            } else {
                that.setState({
                    rows: response.data
                })
            }
        })
    }

    render() {
        console.dir(this.state.rows);
        let rows = this.state.rows.map(function(row) {
                return <RequestRow key={row.id} url={row.url}/>
            }
        );

        return (
            <div>
                {rows}
            </div>
        );
    }
}

RequestViewer.propTypes = {
};


export default RequestViewer;