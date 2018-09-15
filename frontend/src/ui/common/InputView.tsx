import * as React from 'react';
import 'CSS/InputView';

interface InputViewProp {
  value: string;
  emptyValue?: string;
  className: string;

  onEditingStarted?: () => void;
  onValueChanged: (newValue: string) => void;
}

interface InputViewState {
  editingValue?: string;
}

export default class InputView extends React.Component<InputViewProp, InputViewState> {
  constructor(props: InputViewProp) {
    super(props);

    this.onValueChanged = this.onValueChanged.bind(this);
    this.handleNameKeyPress = this.handleNameKeyPress.bind(this);

    this.state = {};
  }

  startEditing() {
    this.setState({
      editingValue: this.props.value ? this.props.value : '',
    });

    if (this.props.onEditingStarted) {
      this.props.onEditingStarted();
    }
  }

  stopEditing() {
    if (this.state.editingValue !== undefined) {
      if (this.state.editingValue !== this.props.value) {
        this.props.onValueChanged(this.state.editingValue);
      }
      this.setState({
        editingValue: undefined,
      });
    }
  }

  onClicked(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    this.startEditing();
  }

  onValueChanged(value: string) {
    this.setState({
      editingValue: value,
    });
  }

  private handleNameKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.stopEditing();
    }
  }

  render() {
    return <div className={this.props.className + ' input_view'} 
      onClick={e => this.onClicked(e)}
      role="textbox"
      tabIndex={0}>
      {this.renderValue()}
      {this.state.editingValue !== undefined ? <div className="input_view_editing">
        <textarea
          autoFocus={true}
          value={this.state.editingValue}
          onChange={(event) => {
            this.onValueChanged(event.target.value);
          }}
          onKeyPress={this.handleNameKeyPress}
          />
      </div> : undefined}
    </div>;
  }

  renderValue(): string {
    let name;
    if (this.state.editingValue) {
      name = this.state.editingValue;
    } else if (this.props.value) {
      name = this.props.value;
    } else if (this.props.emptyValue) {
      name = this.props.emptyValue;
    } else {
      name = '';
    }
    return name;
  }
}
