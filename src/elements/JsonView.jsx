import React from 'react'
import PropTypes from 'prop-types'
import {isObject, isEmptyArray} from "Utils/Tools"

import style from 'CSS/JsonView'

class JsonView extends React.Component {
    constructor(props) {
        super(props);

        this.onKeyClicked = this.onKeyClicked.bind(this);
        this.onValueClicked = this.onValueClicked.bind(this);
        this.onFinishChanging = this.onFinishChanging.bind(this);

        this.state = {
            obj: props.obj,
            isEditable: true,
            editingKey: undefined,
            editingKeyValue: undefined}
    }

    render() {
        let that = this;

        var cells = [];
        let keys = Object.keys(that.state.obj).sort();
        for (var i = 0; i < keys.length; ++i) {
            let key = keys[i];
            let obj = that.state.obj[key];
            let isSubJson = isObject(obj) && !isEmptyArray(obj);


            if (this.state.editingKey == key) {
                cells.push(<div key={'' + 'editing' + '_key'}>
                    <input type="text" value={this.state.editingKeyValue} onChange={function (event) {
                        that.onKeyChanged(key, event.target.value);
                    }}
                    onKeyPress={function(e) {
                        if (e.key === 'Enter') {
                            that.onFinishChanging();
                        }
                    }}/>
                </div>);

            } else {
                cells.push(<div key={'' + key + '_key'} className={"json_key" + (isSubJson ? " sub_json" : "")}
                                onClick={function () {
                                    that.onKeyClicked(key)
                                }}>{key}</div>);
            }

            if (this.state.isEditable) {
                cells.push(<div key={'' + key + '_delete_button'} className={"json_delete" + (isSubJson ? " sub_json" : "")}
                onClick={function () {
                    that.onKeyRemoved(key);
                }}/>);
            }

            cells.push(<div key={'' + key + '_delimeter'} className={"json_delimiter" + (isSubJson ? " sub_json" : "")}/>);

            let bodyKey = '' + key + '_value';
            cells.push(isSubJson ? <div key={bodyKey} className="json_value"><JsonView obj={obj}/></div> : <div key={bodyKey} className="json_value">{obj}</div>);
        }

        return <div className="json_view">
            {cells}
        </div>
    }

    onKeyClicked(key) {
        this.setState({
            editingKey: key,
            editingKeyValue: key
        });
    }

    onKeyChanged(key, newKey) {
        var newObj = this.state.obj;
        newObj[newKey] = newObj[key];
        delete newObj[key];

        this.setState({
            obj: newObj,
            editingKey: newKey,
            editingKeyValue: newKey
        });
    }

    onKeyRemoved(key) {
        var newObj = this.state.obj;
        delete newObj[key];

        this.setState({
            obj: newObj,
            editingKey: undefined,
            editingKeyValue: undefined
        });
    }

    onValueClicked(key) {

    }

    onFinishChanging() {
        this.setState({
            editingKey: undefined,
            editingKeyValue: undefined
        });
    }
}

JsonView.propTypes = {
    obj: PropTypes.any
};

export default JsonView