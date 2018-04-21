import React from 'react';
import PropTypes from 'prop-types';
import { isObject, isEmptyArray } from 'Utils/Tools';

import style from 'CSS/JsonView';

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
      editingKeyName: undefined,
      editingKeyValue: undefined,
    };
  }

  render() {
    const that = this;

    const cells = [];
    const keys = Object.keys(that.state.obj).sort();
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];
      const obj = that.state.obj[key];
      const isSubJson = isObject(obj) && !isEmptyArray(obj);


      if (this.state.editingKey == key && this.state.editingKeyValue == undefined) {
        cells.push(<div key={'' + 'editing' + '_key'}>
          <input
            type="text"
            value={this.state.editingKeyName}
            onChange={function (event) {
                        that.onKeyChanged(key, event.target.value);
                    }}
            onKeyPress={function (e) {
                        if (e.key === 'Enter') {
                            that.onFinishChanging();
                        }
                    }}
          />
        </div>);
      } else {
        cells.push(<div
          key={`${key}_key`}
          className={`json_key${isSubJson ? ' sub_json' : ''}`}
          onClick={function () {
                                    that.onKeyClicked(key);
                                }}
        >{key}
        </div>);
      }

      if (this.state.isEditable) {
        cells.push(<div
          key={`${key}_delete_button`}
          className={`json_delete${isSubJson ? ' sub_json' : ''}`}
          onClick={function () {
                    that.onKeyRemoved(key);
                }}
        />);
      }

      cells.push(<div key={`${key}_delimeter`} className={`json_delimiter${isSubJson ? ' sub_json' : ''}`} />);

      const bodyKey = `${key}_value`;
      cells.push(isSubJson ? <div key={bodyKey} className="json_value"><JsonView obj={obj} /></div> : this.renderJsonValue(key, bodyKey, obj));
    }

    return (<div className="json_view">
      {cells}
            </div>);
  }

  renderJsonValue(key, tagKey, value) {
    const that = this;
    if (this.state.editingKey == key && this.state.editingKeyValue != undefined) {
      return (<div key={'' + 'editing' + '_value'}>
        <input
          type="text"
          value={this.state.editingKeyValue}
          onChange={function (event) {
                        // that.onValueChanged(key, event.target.value);
                    }}
          onKeyPress={function (e) {
                        if (e.key === 'Enter') {
                              // that.onFinishChanging();
                        }
                    }}
        />
              </div>);
    }
    return (<div
      key={tagKey}
      className="json_value"
      onClick={function () {
                that.onValueClicked(key);
            }}
    >{value}
    </div>);
  }

  onKeyClicked(key) {
    this.setState({
      editingKey: key,
      editingKeyName: key,
    });
  }

  onKeyChanged(key, newKey) {
    const newObj = this.state.obj;
    newObj[newKey] = newObj[key];
    delete newObj[key];

    this.setState({
      obj: newObj,
      editingKey: newKey,
      editingKeyName: newKey,
    });
  }

  onKeyRemoved(key) {
    const newObj = this.state.obj;
    delete newObj[key];

    this.setState({
      obj: newObj,
      editingKey: undefined,
      editingKeyName: undefined,
    });
  }

  onValueClicked(key) {
    this.setState({
      editingKey: key,
      editingKeyValue: this.state.obj[key],
    });
  }

  onFinishChanging() {
    this.setState({
      editingKey: undefined,
      editingKeyName: undefined,
    });
  }
}

JsonView.propTypes = {
  obj: PropTypes.any,
};

export default JsonView;
