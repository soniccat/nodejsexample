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
  childExpandLevels: {[key: number] : number};
  editingIndex: number;
  editingKeyName: string;
  editingKeyValue: any;
}

export class JsonView extends React.Component<JsonViewProps, JsonViewState> {
  childRefs: {[key: number] : React.RefObject<JsonView>};
  childIndexes: {[key: string] : number};
  nextChildIndex: number = 1;

  constructor(props: JsonViewProps) {
    super(props);
    this.childRefs = {};
    this.childIndexes = {};

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleWillStartEditing = this.handleWillStartEditing.bind(this);

    const expandedStates : {[key: number] : number} = {};
    const keys = Object.keys(this.props.obj);
    for (let i = 0; i < keys.length; i += 1) {
      const index = this.ensureChildIndex(keys[i]);
      expandedStates[index] = this.defaultChildExpandLevel();
    }

    this.state = {
      childExpandLevels: expandedStates,
      editingIndex: undefined,
      editingKeyName: undefined,
      editingKeyValue: undefined,
    };
  }

  // Events

  onKeyClicked(objKey: string, index: number) {
    this.startKeyEditing(objKey, index);
  }

  onValueClicked(objKey: string, index: number) {
    this.startValueEditing(objKey, index);
  }

  // Actions

  private startKeyEditing(objKey: string, index: number) {
    this.handleWillStartEditing();

    this.setState({
      editingIndex: index,
      editingKeyName: objKey,
    });
  }

  changeKey(oldObjKey: string, newObjKey: string, index: number) {
    const obj = this.props.obj;
    obj[newObjKey] = obj[oldObjKey];
    delete obj[oldObjKey];

    this.childIndexes[newObjKey] = index;
    delete this.childIndexes[oldObjKey];

    this.setState({
      editingKeyName: newObjKey,
    });

    this.props.onObjChanged(this.props.obj);
  }

  removeKey(objKey: string, key: number) {
    const newObj = this.props.obj;
    delete this.childRefs[key];
    delete newObj[objKey];

    this.setState({
      editingIndex: undefined,
      editingKeyName: undefined,
    });

    this.props.onObjChanged(this.props.obj);
  }

  private startValueEditing(objKey: string, index: number) {
    this.handleWillStartEditing();

    this.setState({
      editingIndex: index,
      editingKeyValue: this.props.obj[objKey],
    });
  }

  changeValue(objKey: string, newValue: any) {
    const newObj = this.props.obj;
    newObj[objKey] = newValue;

    this.setState({
      editingKeyValue: newValue,
    });

    this.props.onObjChanged(this.props.obj);
  }

  finishEditing() {
    this.setState({
      editingIndex: undefined,
      editingKeyName: undefined,
      editingKeyValue: undefined,
    });
  }

  expandChild(index: number) {
    // TODO: use mutable-helpber
    const newExpandeStates = this.state.childExpandLevels;
    newExpandeStates[index] = newExpandeStates[index] > 0 ? 0 : 1;

    this.setState({
      childExpandLevels: newExpandeStates,
    });
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

  private ensureRef(index: number): React.Ref<JsonView> {
    let ref = this.childRefs[index];
    if (ref === undefined) {
      ref = React.createRef<JsonView>();
      this.childRefs[index] = ref;
    }

    return ref;
  }

  ensureChildIndex(objKey: string): number {
    let index = this.childIndexes[objKey];
    if (index === undefined) {
      index = this.nextChildIndex;
      this.childIndexes[objKey] = index;
      this.nextChildIndex += 1;
    }

    return index;
  }

  // getObjValue(key: number): any {

  // }

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
      const objKey = keys[i];
      const index = this.ensureChildIndex(keys[i]);
      const obj = this.props.obj[objKey];
      const isSubJson = isObject(obj) && !isEmptyArray(obj);

      if (isSubJson) {
        cells.push(this.renderExpandButton(this.state.childExpandLevels[index] > 0, index, isSubJson));
      }

      cells.push(this.renderKey(objKey, index, isSubJson));

      if (this.props.isEditable) {
        cells.push(this.renderDeleteButton(objKey, index, isSubJson));
      }

      cells.push(<div key={`${index}_delimeter`}
        className={`json_delimiter${isSubJson ? ' sub_json' : ''}`}>:</div>);

      const bodyKey = `${index}_value`;
      let element;
      if (isSubJson) {
        const ref = this.ensureRef(index);
        element = <div key={bodyKey} className="json_value">
          <JsonView obj={obj}
            isEditable={this.props.isEditable}
            expandLevel={this.state.childExpandLevels[index]}
            onObjChanged={() => this.props.onObjChanged(this.props.obj)}
            onCollapsedPressed={obj => this.expandChild(index)}
            willStartEditing={this.handleWillStartEditing}
            ref={ref}/>
        </div>;
      } else {
        element = this.renderJsonValue(objKey, index, bodyKey, obj);
      }

      cells.push(element);
    }
  }

  private renderExpandButton(isExpanded: boolean, index: number, isSubJson: boolean): any {
    return <div key={`${index}_expand_button`}
      className={`json_expand${isSubJson ? ' sub_json' : ''}`}
      onClick={() => { this.expandChild(index); } }
      role="button"
      tabIndex={0}>
        {isExpanded ? '-' : '+'}
      </div>;
  }

  private renderDeleteButton(objKey: string, index: number, isSubJson: boolean): any {
    return <div key={`${index}_delete_button`}
      className={`json_delete${isSubJson ? ' sub_json' : ''}`}
      onClick={() => { this.removeKey(objKey, index); } }
      role="button"
      tabIndex={0}>(del)</div>;
  }

  private renderKey(objKey: string, index: number, isSubJson: boolean): any {
    let textarea;
    if (this.state.editingIndex === index && this.state.editingKeyValue === undefined) {
      textarea = <div key={'' + 'editing_key'}>
        <textarea
        autoFocus={true}
        value={this.state.editingKeyName}
        onChange={(event) => {
          this.changeKey(objKey, event.target.value, index);
        } }
        onKeyPress={this.handleKeyPress} />
      </div>;
    }

    return <div key={`${index}_key`}
      className={`json_key${isSubJson ? ' sub_json' : ''}`}
      onClick={() => {
        if (textarea === undefined) {
          this.onKeyClicked(objKey, index);
        }
      }
    }
      role="textbox"
      tabIndex={0}>
        <div>{objKey}</div>
        {textarea}
    </div>;
  }

  renderJsonValue(objKey: string, index: number, tagKey: string, value: any) {
    let textarea;
    if (this.state.editingIndex === index && this.state.editingKeyValue !== undefined) {
      textarea = this.renderJsonValueTextArea(objKey);
    }

    return (<div
      key={tagKey}
      className="json_value"
      onClick={() => { this.onValueClicked(objKey, index); }}
      onKeyPress={() => {
        if (textarea === undefined) {
          this.onValueClicked(objKey, index);
        }
      }
    }
      role="textbox"
      tabIndex={0}>
        <div>{value}</div>
        {textarea}
    </div>);
  }

  renderJsonValueTextArea(objKey:string) {
    return (<div key="editing_value">
      <textarea
        autoFocus={true}
        value={this.state.editingKeyValue}
        onChange={(event) => {
          this.changeValue(objKey, event.target.value);
        }}
        onKeyPress={this.handleKeyPress}
      />
    </div>);
  }
}

export default JsonView;
