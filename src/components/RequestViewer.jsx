import React from 'react';
import PropTypes from 'prop-types';
import RequestRow from 'Elements/RequestRow';
import loadRequest from 'Utils/loadRequest'
import {buildRequestOptions} from 'Utils/RequestOptions';
import handleRequestResponse from 'Utils/handleRequestResponse'

class RequestViewer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {requestOptions: {
                                fields: ["id", "url", "method",
                                    "header", "body_json", "body_string",
                                    "response_status", "response_header", "response_json", "response_string"],
                                urlRegexp: ".*v4.*",
                                onlyNotNull: false
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
        loadRequest(options, handleRequestResponse(function (err, response) {
            if (err != undefined) {
                that.setState({
                    error: err
                })
            } else {
                that.setState({
                    rows: response.data
                })
            }
        }))
    }

    render() {
        console.dir(this.state.rows);
        let rows = this.state.rows.map(function(row) {
                return <RequestRow key={row.id}
                                   url={row.url}
                                   method={row.method}
                                   header={row.header}
                                   body={row.body}
                                   responseStatus={row.responseStatus}
                                   responseHeader={row.responseHeader}
                                   responseBody={row.responseBody}
                                   />
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