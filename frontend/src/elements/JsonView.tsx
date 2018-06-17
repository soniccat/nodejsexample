import * as React from 'react';
import { isObject, isEmptyArray } from 'Utils/Tools';

// import style from 'CSS/JsonView';
require('CSS/JsonView');

export interface JsonViewProps {
  obj: any;
  isEditable: boolean;
  expandLevel: number;
  onObjChanged: (obj: any) => void;
  onCollapsedPressed: (obj: any) => void;
}

export interface JsonViewState {
  childExpandLevels: {[key: string] : number};
  editingKey: string;
  editingKeyName: string;
  editingKeyValue: any;
}

export class JsonView extends React.Component<JsonViewProps, JsonViewState> {
  constructor(props: JsonViewProps) {
    super(props);

    const expandedStates : {[key: string] : number} = {};
    const keys = Object.keys(this.props.obj);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      expandedStates[key] = this.defaultChildExpandLevel();
    }

    this.state = {
      childExpandLevels: expandedStates,
      editingKey: undefined,
      editingKeyName: undefined,
      editingKeyValue: undefined,
    };
  }

  // Events

  onKeyClicked(key) {
    this.startKeyEditing(key);
  }

  onValueClicked(key) {
    this.startValueEditing(key);
  }

  // Actions

  private startKeyEditing(key: any) {
    this.setState({
      editingKey: key,
      editingKeyName: key,
    });
  }

  changeKey(key, newKey) {
    const newObj = this.props.obj;
    newObj[newKey] = newObj[key];
    delete newObj[key];

    this.setState({
      editingKey: newKey,
      editingKeyName: newKey,
    });

    this.props.onObjChanged(this.props.obj);
  }

  removeKey(key) {
    const newObj = this.props.obj;
    delete newObj[key];

    this.setState({
      editingKey: undefined,
      editingKeyName: undefined,
    });

    this.props.onObjChanged(this.props.obj);
  }

  private startValueEditing(key: any) {
    this.setState({
      editingKey: key,
      editingKeyValue: this.props.obj[key],
    });
  }

  changeValue(key, newValue) {
    const newObj = this.props.obj;
    newObj[key] = newValue;

    this.setState({
      editingKeyValue: newValue,
    });

    this.props.onObjChanged(this.props.obj);
  }

  finishEditing() {
    this.setState({
      editingKey: undefined,
      editingKeyName: undefined,
    });
  }

  expandChild(key: string) {
    const newExpandeStates = this.state.childExpandLevels;
    newExpandeStates[key] = newExpandeStates[key] > 0 ? 0 : 1;

    this.setState({
      childExpandLevels: newExpandeStates,
    });
  }

  // Getters

  private defaultChildExpandLevel(): number {
    return this.props.expandLevel > 0 ? this.props.expandLevel - 1 : 0;
  }

  isExpanded() {
    return this.props.expandLevel > 0;
  }

  // Rendering

  render() {
    const cells = [];

    if (this.isExpanded()) {
      this.renderExpandedContent(cells);
    } else {
      cells.push(<div key={'collapsed'}
       onClick={() => { this.props.onCollapsedPressed(this.props.obj); }}>collapsed</div>);
    }

    return (<div className="json_view">
      {cells}
    </div>);
  }

  private renderExpandedContent(cells: any[]) {
    const keys = Object.keys(this.props.obj).sort();
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const obj = this.props.obj[key];
      const isSubJson = isObject(obj) && !isEmptyArray(obj);

      if (isSubJson) {
        cells.push(this.renderExpandButton(this.state.childExpandLevels[key] > 0, key, isSubJson));
      }

      cells.push(this.renderKey(key, isSubJson));

      if (this.props.isEditable) {
        cells.push(this.renderDeleteButton(key, isSubJson));
      }

      cells.push(<div key={`${key}_delimeter`}
        className={`json_delimiter${isSubJson ? ' sub_json' : ''}`} />);

      const bodyKey = `${key}_value`;
      cells.push(isSubJson ?
        <div key={bodyKey} className="json_value">
          <JsonView obj={obj}
            isEditable={this.props.isEditable}
            expandLevel={this.state.childExpandLevels[key]}
            onObjChanged={() => this.props.onObjChanged(this.props.obj)}
            onCollapsedPressed={obj => this.expandChild(key)}/>
        </div>
        : this.renderJsonValue(key, bodyKey, obj));
    }
  }

  private renderExpandButton(isExpanded: boolean, key: string, isSubJson: boolean): any {
    return <div key={`${key}_expand_button`}
      className={`json_expand${isSubJson ? ' sub_json' : ''}`}
      onClick={() => { this.expandChild(key); } }
      role="button"
      tabIndex={0}>
        {isExpanded ? '-' : '+'}
      </div>;
  }

  private renderDeleteButton(key: string, isSubJson: boolean): any {
    return <div key={`${key}_delete_button`}
      className={`json_delete${isSubJson ? ' sub_json' : ''}`}
      onClick={() => { this.removeKey(key); } }
      role="button"
      tabIndex={0} />;
  }

  private renderKey(key: string, isSubJson: boolean): any {
    if (this.state.editingKey === key && this.state.editingKeyValue === undefined) {
      return <div key={'' + 'editing' + '_key'}>
        <input type="text"
        value={this.state.editingKeyName}
        onChange={(event) => {
          this.changeKey(key, event.target.value);
        } }
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            this.finishEditing();
          }
        } } />
      </div>;
    }

    return <div key={`${key}_key`}
      className={`json_key${isSubJson ? ' sub_json' : ''}`}
      onClick={() => { this.onKeyClicked(key); } }
      role="textbox"
      tabIndex={0}>{key}
    </div>;
  }

  renderJsonValue(key: string, tagKey: string, value: any) {
    if (this.state.editingKey === key && this.state.editingKeyValue !== undefined) {
      return (<div key="editing_value">
        <input
          type="text"
          value={this.state.editingKeyValue}
          onChange={(event) => {
            this.changeValue(key, event.target.value);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              this.finishEditing();
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
