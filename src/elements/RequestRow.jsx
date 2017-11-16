import React from 'react';
import PropTypes from 'prop-types';

class RequestRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {url: props.url}
    }

    render() {
        return (
            <div>
                {this.state.url}
            </div>
        );
    }
}

RequestRow.propTypes = {
    url: PropTypes.string.isRequired
};

export default RequestRow;