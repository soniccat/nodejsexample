import React from 'react'
import PropTypes from 'prop-types'
import {isObject, isEmptyArray} from "Utils/Tools"

import style from 'CSS/JsonView'

class JsonView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            obj: props.obj}
    }

    render() {
        let that = this;

        var cells = [];
        let keys = Object.keys(that.state.obj);
        for (var i = 0; i < keys.length; ++i) {
            let key = keys[i];
            let obj = that.state.obj[key];
            let isSubJson = isObject(obj) && !isEmptyArray(obj);

            cells.push(<div key={'' + key + '_key'} className={"json_key" + (isSubJson ? " sub_json" : "")}>{key}</div>);
            cells.push(<div key={'' + key + '_delimeter'} className={"json_delimiter" + (isSubJson ? " sub_json" : "")}/>);

            let bodyKey = '' + key + '_value';
            cells.push(isSubJson ? <div key={bodyKey}><JsonView obj={obj}/></div> : <div key={bodyKey} className="json_value">{obj}</div>);
        }

        return <div className="json_view">
            {cells}
        </div>
    }
}

JsonView.propTypes = {
    obj: PropTypes.any
};

export default JsonView