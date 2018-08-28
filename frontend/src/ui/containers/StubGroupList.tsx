import * as React from 'react';
import Request from 'Model/Request';
import DataHolder from 'Data/DataHolder';
import StubGroup from 'Model/StubGroup';
import 'CSS/StubGroupList';

export interface StubGroupListProps {
  request: Request;
  dataHolder: DataHolder;
}

export interface StubGroupListState {
  newGroupName: string;
}

export class StubGroupList extends React.Component<StubGroupListProps, StubGroupListState> {
  static defaultProps = {
  };

  constructor(props: StubGroupListProps) {
    super(props);

    this.onNameChanged = this.onNameChanged.bind(this);
    this.onEnterPressed = this.onEnterPressed.bind(this);

    this.state = {
      newGroupName: '',
    };
  }

  // Events

  componentDidMount() {
    if (this.props.dataHolder.stubGroups == null) {
      this.props.dataHolder.loadStubGroups();
    }
  }

  removeRequestFromStubGroup(stub: StubGroup) {
    this.props.dataHolder.deleteRequestFromStubGroup(stub.id, this.props.request.id);
  }

  addRequestToStubGroup(stub: StubGroup) {
    this.props.dataHolder.addRequestInStubGroup(stub.id, this.props.request.id);
  }

  onNameChanged(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      newGroupName: e.target.value,
    });
  }

  onEnterPressed(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.props.dataHolder.createStubGroup(this.state.newGroupName);
    }
  }

  render() {
    const stubGroups = this.props.dataHolder.stubGroups ? this.props.dataHolder.stubGroups : [];
    const rows = stubGroups.map((stub) => {
      const isAdded = stub.requests.find((value: Request, index: number, obj: Request[]) => {
        return this.props.request.id === value.id;
      }) != null;
      return <div key={stub.id} className="stub_group_list_row">
        <input type="checkbox"
        onChange={() => isAdded ? this.removeRequestFromStubGroup(stub) : this.addRequestToStubGroup(stub)}
        checked={isAdded}/>
        <div className="stub_group_list_name">{stub.name}</div>
      </div>;
    });

    rows.push(<div key="input" className="stub_group_list_create_row">
      <input type="field" onChange={this.onNameChanged} onKeyDown={this.onEnterPressed}/>
    </div>);

    return <div>{rows}</div>;
  }
}

export default StubGroupList;
