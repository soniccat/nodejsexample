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
}

export class StubGroupList extends React.Component<StubGroupListProps, StubGroupListState> {
  static defaultProps = {
  };

  constructor(props: StubGroupListProps) {
    super(props);

    this.state = {
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

  render() {
    const stubGroups = this.props.dataHolder.stubGroups ? this.props.dataHolder.stubGroups : [];
    const rows = stubGroups.map((stub) => {
      const isAdded = stub.requests.find((value: Request, index: number, obj: Request[]) => {
        return this.props.request.id === value.id;
      }) !== undefined;
      return <div key={stub.id} className="stub_group_list_row">
        <input type="checkbox"
        onChange={() => isAdded ? this.removeRequestFromStubGroup(stub) : this.addRequestToStubGroup(stub)}
        checked={isAdded}/>
        <div className="stub_group_list_name">{stub.name}</div>
      </div>;
    });

    return <div>{rows}</div>;
  }
}

export default StubGroupList;
