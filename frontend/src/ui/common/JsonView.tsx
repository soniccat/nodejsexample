import * as React from 'react';
import { isObject, isEmptyArray } from 'Utils/Tools';
import ExpandButton from './ExpandButton';
import InputView from './InputView';
import 'CSS/JsonView';

export interface JsonViewProps {
  obj: any;
  isEditable: boolean;
  expandLevel: number;

  onObjChanged: (obj: any) => void;
  onCollapsedPressed: (obj: any) => void;
  willStartEditing?: () => void;
}

export interface JsonViewState {
  childExpandLevels: {[index: number] : number};
  editingIndex: number;
  editingKeyName: string;
}

export class JsonView extends React.Component<JsonViewProps, JsonViewState> {
  childRefs: {[index: number] : React.RefObject<JsonView>} = {};
  inputViewRefs: React.RefObject<InputView>[] = [];
  childIndexes: {[key: string] : number} = {};
  nextChildIndex: number = 1;

  constructor(props: JsonViewProps) {
    super(props);

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleWillStartEditing = this.handleWillStartEditing.bind(this);
    this.onCollapsedPressed = this.onCollapsedPressed.bind(this);
    this.onObjChanged = this.onObjChanged.bind(this);
    this.onEditingStarted = this.onEditingStarted.bind(this);

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
    };
  }

  // Actions

  changeKey(oldObjKey: string, newObjKey: string, index: number) {
    const obj = this.props.obj;
    const newObj = Object.assign({}, obj, { [newObjKey]: obj[oldObjKey] });
    delete newObj[oldObjKey];

    this.childIndexes[newObjKey] = index;
    delete this.childIndexes[oldObjKey];

    this.setState({
      editingKeyName: newObjKey,
    });

    this.props.onObjChanged(newObj);
  }

  removeKey(objKey: string) {
    const newObj = Object.assign({}, this.props.obj);
    delete newObj[objKey];

    this.setState({
      editingIndex: undefined,
      editingKeyName: undefined,
    });

    this.props.onObjChanged(newObj);
  }

  changeValue(objKey: string, newValue: any) {
    const newObj = Object.assign({}, this.props.obj, { [objKey]: newValue });
    this.props.onObjChanged(newObj);
  }

  finishEditing() {
    this.setState({
      editingIndex: undefined,
      editingKeyName: undefined,
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
    for (const index in this.childRefs) {
      this.childRefs[index].current.stopEditing();
    }

    this.inputViewRefs.forEach(o => o.current.stopEditing());
    this.finishEditing();
  }

  private handleKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.finishEditing();
    }
  }

  private handleWillStartEditing() {
    if (this.props.willStartEditing != null) {
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

  private createChildRef(index: number): React.Ref<JsonView> {
    const ref = React.createRef<JsonView>();
    this.childRefs[index] = ref;
    return ref;
  }

  private createInputViewRef() {
    const ref = React.createRef<InputView>();
    this.inputViewRefs.push(ref);
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

  // Rendering

  render() {
    const cells = [];
    this.childRefs = [];
    this.inputViewRefs = [];

    if (this.isExpanded()) {
      this.renderExpandedContent(cells);
    } else {
      cells.push(<div key={'collapsed'}
       onClick={this.onCollapsedPressed}>collapsed</div>);
    }

    return (<div className="json_view">
      {cells}
    </div>);
  }

  private onCollapsedPressed() {
    this.props.onCollapsedPressed(this.props.obj);
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
        const ref = this.createChildRef(index);
        element = <div key={bodyKey} className="json_value">
          <JsonView obj={obj}
            isEditable={this.props.isEditable}
            expandLevel={this.state.childExpandLevels[index]}
            onObjChanged={ obj => this.onObjChanged(objKey, obj) }
            onCollapsedPressed={obj => this.expandChild(index)}
            willStartEditing={this.handleWillStartEditing}
            ref={ref}/>
        </div>;
      } else {
        element = this.renderJsonValue(objKey, bodyKey, obj);
      }

      cells.push(element);
    }
  }

  private onObjChanged(objKey: string, obj: any) {
    const newObj = Object.assign({}, this.props.obj, { [objKey]: obj });
    this.props.onObjChanged(newObj);
  }

  private renderExpandButton(isExpanded: boolean, index: number, isSubJson: boolean): any {
    return <ExpandButton key={`${index}_expand_button`}
      className={`json_expand${isSubJson ? ' sub_json' : ''}`}
      onClick={() => { this.expandChild(index); } }
      isExpanded = {isExpanded}/>;
  }

  private renderDeleteButton(objKey: string, index: number, isSubJson: boolean): any {
    return <div key={`${index}_delete_button`}
      className={`json_delete${isSubJson ? ' sub_json' : ''}`}
      onClick={() => { this.removeKey(objKey); } }
      role="button"
      tabIndex={0}>(del)</div>;
  }

  private renderKey(objKey: string, index: number, isSubJson: boolean): any {
    const ref = this.createInputViewRef();
    return (<InputView
      key={`${index}_key`}
      className={`json_key${isSubJson ? ' sub_json' : ''}`}
      value={objKey}
      onEditingStarted={this.onEditingStarted}
      onValueChanged={(newValue) => {
        this.changeKey(objKey, newValue, index);
      }}
      ref={ref}
      />
    );
  }

  renderJsonValue(objKey: string, tagKey: string, value: any) {
    const ref = this.createInputViewRef();
    return (<InputView
      key={tagKey}
      className="json_value"
      value={value}
      onEditingStarted={this.onEditingStarted}
      onValueChanged={(newValue) => {
        this.changeValue(objKey, newValue);
      }}
      ref={ref}
      />
    );
  }

  onEditingStarted() {
    this.handleWillStartEditing();
  }
}

export default JsonView;
