import React from 'react'
import PropTypes from 'prop-types'
import {isObject} from "Utils/Tools"

import style from 'CSS/JsonView'

class JsonView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            obj: props.obj}
    }

    render() {
        let that = this;
        let rows = Object.keys(that.state.obj).map(function(key) {
            return <div key={key} className="json_row">
                <div className="json_key">{key}</div>
                <div className="json_delimiter"/>
                {isObject(that.state.obj[key]) ? <JsonView obj={that.state.obj[key]}/> : <div className="json_value">{that.state.obj[key]}</div>}
            </div>
        });

        return <div className="json_view">
            {rows}
        </div>
    }
}

JsonView.propTypes = {
    obj: PropTypes.any
};

export default JsonView