import React from 'react';
import PropTypes from 'prop-types';
import RequestRow from 'Elements/RequestRow';
import loadRequest from 'Utils/loadRequest'
import {buildRequestOptions} from 'Utils/RequestOptions';
import handleRequestResponse from 'Utils/handleRequestResponse'

class RequestViewer extends React.Component {

    constructor(props) {
        super(props);

        this.onSearchChanged = this.onSearchChanged.bind(this);

        this.state = {requestOptions: {
                                fields: ["id", "url", "method",
                                    "header", "body_string", "body_string_is_json",
                                    "response_status", "response_header", "response_string", "response_string_is_json"],
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
                <input id="searchField"
                       type="text"
                       value={this.state.requestOptions.urlRegexp}
                       onChange={this.onSearchChanged}/>
                {rows}
            </div>
        );
    }

    onSearchChanged(event) {
        this.setState({requestOptions:{urlRegexp: event.target.value}}, function(prevState, props) {
            console.log("regexp " + this.state.requestOptions.urlRegexp);
            this.loadRequests();
        });
    }
}

RequestViewer.propTypes = {
};


export default RequestViewer;