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
        this.onCreateStubClicked = this.onCreateStubClicked.bind(this);

        this.state = {requestOptions: {
                                fields: ["id", "url", "method",
                                    "header", "body_string", "body_string_is_json",
                                    "response_status", "response_header", "response_string", "response_string_is_json",
                                    "is_stub"],
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

        loadRequest(options, handleRequestResponse((err, response) => {
            if (err) {
                this.setState({
                    error: err
                })
            } else {
                this.setState({
                    rows: response.data
                })
            }
        }))
    }

    render() {
        console.dir(this.state.rows);
        let rows = this.state.rows.map(row => {
                return <RequestRow key={row.id}
                                   url={row.url}
                                   method={row.method}
                                   header={row.header}
                                   body={row.body}
                                   responseStatus={row.responseStatus}
                                   responseHeader={row.responseHeader}
                                   responseBody={row.responseBody}
                                   isStub={row.isStub}

                                   onCreateStubClicked={this.onCreateStubClicked}
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
        this.setState({requestOptions:{urlRegexp: event.target.value}}, (prevState, props) => {
            console.log("regexp " + this.state.requestOptions.urlRegexp);
            this.loadRequests();
        });
    }

    onCreateStubClicked() {
        
    }
}

RequestViewer.propTypes = {
};


export default RequestViewer;