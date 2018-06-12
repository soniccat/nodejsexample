import * as React from 'react';
import PropTypes from 'prop-types';
import { isObject, isEmptyArray } from 'Utils/Tools';

//import style from 'CSS/JsonView';
require('CSS/JsonView');

export interface JsonViewProps { 
  obj: any;
  isEditable: PropTypes.bool;
}

export interface JsonViewState {
  obj: any;
  isEditable: boolean;
  editingKey: string;
  editingKeyName: string;
  editingKeyValue: any;
} 

export class JsonView extends React.Component<JsonViewProps, JsonViewState> {
  constructor(props: JsonViewProps) {
    super(props);

    this.state = {
      obj: props.obj,
      isEditable: props.isEditable,
      editingKey: undefined,
      editingKeyName: undefined,
      editingKeyValue: undefined,
    };
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

  render() {
    const cells = [];
    const keys = Object.keys(this.state.obj).sort();
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];
      const obj = this.state.obj[key];
      const isSubJson = isObject(obj) && !isEmptyArray(obj);

      cells.push(this.renderKey(key, isSubJson));

      if (this.state.isEditable) {
        cells.push(<div key={`${key}_delete_button`} 
          className={`json_delete${isSubJson ? ' sub_json' : ''}`} 
          onClick={() => { this.onKeyRemoved(key); } } 
          role="textbox" 
          tabIndex={0} />);
      }

      cells.push(<div key={`${key}_delimeter`} 
        className={`json_delimiter${isSubJson ? ' sub_json' : ''}`} />);

      const bodyKey = `${key}_value`;
      cells.push(isSubJson ? 
        <div key={bodyKey} 
          className="json_value">
          <JsonView 
            obj={obj} 
            isEditable={this.props.isEditable} />
        </div> 
        : this.renderJsonValue(key, bodyKey, obj));
    }

    return (<div className="json_view">
      {cells}
    </div>);
  }

  private renderKey(key: string, isSubJson: boolean): any {
    if (this.state.editingKey === key && !this.state.editingKeyValue) {
      return <div key={'' + 'editing' + '_key'}>
        <input type="text" value={this.state.editingKeyName} onChange={(event) => {
          this.onKeyChanged(key, event.target.value);
        } } onKeyPress={(e) => {
          if (e.key === 'Enter') {
            this.onFinishChanging();
          }
        } } />
      </div>;
    }
    else {
      return <div key={`${key}_key`} 
        className={`json_key${isSubJson ? ' sub_json' : ''}`} 
        onClick={() => { this.onKeyClicked(key); } } 
        role="textbox" tabIndex={0}>{key}
      </div>;
    }
  }

  renderJsonValue(key: string, tagKey: string, value: any) {
    if (this.state.editingKey === key && this.state.editingKeyValue) {
      return (<div key="editing_value">
        <input
          type="text"
          value={this.state.editingKeyValue}
          onChange={(event) => {
                        // this.onValueChanged(key, event.target.value);
                    }}
          onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                              // this.onFinishChanging();
                        }
                    }}
        />
      </div>);
    }
    return (<div
      key={tagKey}
      className="json_value"
      onClick={() => { this.onValueClicked(key); }}
      onKeyPress={() => { this.onValueClicked(key); }}
      role="textbox"
      tabIndex={0}>{value}
    </div>);
  }
}

export default JsonView;
