import * as React from 'react';
import { isObject, isEmptyArray } from 'Utils/Tools';

//import style from 'CSS/JsonView';
require('CSS/JsonView');

export interface JsonViewProps { 
  obj: any;
  isEditable: boolean;
  isExpanded: boolean;
}

export interface JsonViewState {
  obj: any;
  isEditable: boolean;
  isExpanded: boolean;
  valueExpandeStates: {[key: string] : boolean};
  editingKey: string;
  editingKeyName: string;
  editingKeyValue: any;
} 

export class JsonView extends React.Component<JsonViewProps, JsonViewState> {
  constructor(props: JsonViewProps) {
    super(props);

    var expandedStates : {[key: string] : boolean} = {};
    const keys = Object.keys(this.props.obj);
    for (let i = 0; i < keys.length; ++i) {
      let key = keys[i];
      expandedStates[key] = props.isExpanded;
    }

    this.state = {
      obj: props.obj,
      isEditable: props.isEditable,
      isExpanded: props.isExpanded,
      valueExpandeStates: expandedStates,
      editingKey: undefined,
      editingKeyName: undefined,
      editingKeyValue: undefined,
    };
  }

  static getDerivedStateFromProps(props : JsonViewProps, state : JsonViewState) {
    if (props.isExpanded !== state.isExpanded) {
      return {
        isExpanded : props.isExpanded
      };
    }

    // Return null to indicate no change to state.
    return null;
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

  onValueChanged(key, newValue) {
    const newObj = this.state.obj;
    newObj[key] = newValue;

    this.setState({
      obj: newObj,
      editingKeyValue: newValue,
    });
  }

  onFinishChanging() {
    this.setState({
      editingKey: undefined,
      editingKeyName: undefined,
    });
  }

  onExpandPressed(key: string) {
    let newExpandeStates = this.state.valueExpandeStates
    newExpandeStates[key] = !newExpandeStates[key]

    this.setState({
      valueExpandeStates: newExpandeStates
    })
  }

  

  render() {
    const cells = [];

    if (this.state.isExpanded) {
      this.renderExpandedContent(cells);
    } else {
      cells.push(<div>collapsed</div>)
    }

    return (<div className="json_view">
      {cells}
    </div>);
  }

  private renderExpandedContent(cells: any[]) {
    const keys = Object.keys(this.state.obj).sort();
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];
      const obj = this.state.obj[key];
      const isSubJson = isObject(obj) && !isEmptyArray(obj);
      if (isSubJson) {
        cells.push(this.renderExpandButton(this.state.valueExpandeStates[key], key, isSubJson));
      }
      cells.push(this.renderKey(key, isSubJson));
      if (this.state.isEditable) {
        cells.push(this.renderDeleteButton(key, isSubJson));
      }
      cells.push(<div key={`${key}_delimeter`} className={`json_delimiter${isSubJson ? ' sub_json' : ''}`} />);
      const bodyKey = `${key}_value`;
      cells.push(isSubJson ?
        <div key={bodyKey} className="json_value">
          <JsonView obj={obj} isEditable={this.props.isEditable} isExpanded={this.state.valueExpandeStates[key]} />
        </div>
        : this.renderJsonValue(key, bodyKey, obj));
    }
  }

  private renderExpandButton(isExpanded: boolean, key: string, isSubJson: boolean): any {
    return <div key={`${key}_expand_button`} 
      className={`json_expand${isSubJson ? ' sub_json' : ''}`} 
      onClick={() => { this.onExpandPressed(key); } } 
      role="button" 
      tabIndex={0}>
        {isExpanded ? "-" : "+"}
      </div>;
  }

  private renderDeleteButton(key: string, isSubJson: boolean): any {
    return <div key={`${key}_delete_button`} 
      className={`json_delete${isSubJson ? ' sub_json' : ''}`} 
      onClick={() => { this.onKeyRemoved(key); } } 
      role="button" 
      tabIndex={0} />;
  }

  private renderKey(key: string, isSubJson: boolean): any {
    if (this.state.editingKey === key && !this.state.editingKeyValue) {
      return <div key={'' + 'editing' + '_key'}>
        <input type="text" 
        value={this.state.editingKeyName} 
        onChange={(event) => {
          this.onKeyChanged(key, event.target.value);
        } } 
        onKeyPress={(e) => {
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
        role="textbox" 
        tabIndex={0}>{key}
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
                        this.onValueChanged(key, event.target.value);
                    }}
          onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                              this.onFinishChanging();
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
