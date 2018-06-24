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
  willStartEditing?: () => void;
}

export interface JsonViewState {
  childExpandLevels: {[key: string] : number};
  editingKey: string;
  editingKeyName: string;
  editingKeyValue: any;
}

export class JsonView extends React.Component<JsonViewProps, JsonViewState> {
  childRefs: {[key:string] : React.RefObject<JsonView>};

  constructor(props: JsonViewProps) {
    super(props);

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleWillStartEditing = this.handleWillStartEditing.bind(this);

    const expandedStates : {[key: string] : number} = {};
    const keys = Object.keys(this.props.obj);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      expandedStates[key] = this.defaultChildExpandLevel();
    }

    this.childRefs = {};
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
    this.handleWillStartEditing();

    this.setState({
      editingKey: key,
      editingKeyName: key,
    });
  }

  changeKey(key, newKey) {
    const newObj = this.props.obj;
    newObj[newKey] = newObj[key];
    delete newObj[key];

    if (this.childRefs[key] !== undefined) {
      this.childRefs[newKey] = this.childRefs[key];
      delete this.childRefs[key];
    }

    // TODO: use mutable-helpber
    const newExpandeStates = this.state.childExpandLevels;
    newExpandeStates[newKey] = newExpandeStates[key];
    delete newExpandeStates[key];

    this.setState({
      editingKey: newKey,
      editingKeyName: newKey,
      childExpandLevels: newExpandeStates,
    });

    this.props.onObjChanged(this.props.obj);
  }

  removeKey(key) {
    const newObj = this.props.obj;
    delete this.childRefs[key];
    delete newObj[key];

    this.setState({
      editingKey: undefined,
      editingKeyName: undefined,
    });

    this.props.onObjChanged(this.props.obj);
  }

  private startValueEditing(key: any) {
    this.handleWillStartEditing();

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
      editingKeyValue: undefined,
    });
  }

  expandChild(key: string) {
    // TODO: use mutable-helpber
    const newExpandeStates = this.state.childExpandLevels;
    newExpandeStates[key] = newExpandeStates[key] > 0 ? 0 : 1;

    this.setState({
      childExpandLevels: newExpandeStates,
    });
  }

  private ensureRef(key: string) : React.Ref<JsonView> {
    let ref = this.childRefs[key];
    if (ref === undefined) {
      ref = React.createRef<JsonView>();
      this.childRefs[key] = ref;
    }

    return ref;
  }

  private stopEditing() {
    for (const key in this.childRefs) {
      this.childRefs[key].current.stopEditing();
    }

    this.finishEditing();
  }

  private handleKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.finishEditing();
    }
  }

  private handleWillStartEditing() {
    if (this.props.willStartEditing !== undefined) {
      this.props.willStartEditing();
    } else {
      this.stopEditing();
    }
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
        className={`json_delimiter${isSubJson ? ' sub_json' : ''}`}>:</div>);

      const bodyKey = `${key}_value`;
      let element;
      if (isSubJson) {
        const ref = this.ensureRef(key);
        element = <div key={bodyKey} className="json_value">
          <JsonView obj={obj}
            isEditable={this.props.isEditable}
            expandLevel={this.state.childExpandLevels[key]}
            onObjChanged={() => this.props.onObjChanged(this.props.obj)}
            onCollapsedPressed={obj => this.expandChild(key)}
            willStartEditing={this.handleWillStartEditing}
            ref={ref}/>
        </div>;
      } else {
        element = this.renderJsonValue(key, bodyKey, obj);
      }

      cells.push(element);
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
      tabIndex={0}>(del)</div>;
  }

  private renderKey(key: string, isSubJson: boolean): any {
    let textarea;
    if (this.state.editingKey === key && this.state.editingKeyValue === undefined) {
      textarea = <div key={'' + 'editing_key'}>
        <textarea
        autoFocus={true}
        value={this.state.editingKeyName}
        onChange={(event) => {
          this.changeKey(key, event.target.value);
        } }
        onKeyPress={this.handleKeyPress} />
      </div>;
    }

    return <div key={`${key}_key`}
      className={`json_key${isSubJson ? ' sub_json' : ''}`}
      onClick={() => {
        if (textarea === undefined) {
          this.onKeyClicked(key);
        }
      }
    }
      role="textbox"
      tabIndex={0}>
        <div>{key}</div>
        {textarea}
    </div>;
  }

  renderJsonValue(key: string, tagKey: string, value: any) {
    let textarea;
    if (this.state.editingKey === key && this.state.editingKeyValue !== undefined) {
      textarea = this.renderJsonValueTextArea(key, tagKey, value);
    }

    return (<div
      key={tagKey}
      className="json_value"
      onClick={() => { this.onValueClicked(key); }}
      onKeyPress={() => {
        if (textarea === undefined) {
          this.onValueClicked(key);
        }
      }
    }
      role="textbox"
      tabIndex={0}>
        <div>{value}</div>
        {textarea}
    </div>);
  }

  renderJsonValueTextArea(key: string, tagKey: string, value: any) {
    return (<div key="editing_value">
      <textarea
        autoFocus={true}
        value={this.state.editingKeyValue}
        onChange={(event) => {
          this.changeValue(key, event.target.value);
        }}
        onKeyPress={this.handleKeyPress}
      />
    </div>);
  }
}

export default JsonView;
