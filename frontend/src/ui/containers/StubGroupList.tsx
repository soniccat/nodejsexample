import * as React from 'react';
import Request from 'Model/Request';
import DataHolder from 'Data/DataHolder';
import StubGroup from 'Model/StubGroup';

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

  }

  addRequestToStubGroup(stub: StubGroup) {
    this.props.dataHolder.addRequestInStubGroups(stub.id, this.props.request.id);
  }

  render() {
    const stubGroups = this.props.dataHolder.stubGroups ? this.props.dataHolder.stubGroups : [];
    const rows = stubGroups.map((stub) => {
      const isAdded = stub.requests.find((value: Request, index: number, obj: Request[]) => {
        return this.props.request.id === value.id;
      }) !== undefined;
      return <div key={stub.id}>
        <input type="checkbox"
        onChange={() => isAdded ? this.removeRequestFromStubGroup(stub) : this.addRequestToStubGroup(stub)}
        checked={isAdded}/>
        <div>{stub.name}</div>
      </div>;
    });

    return <div>{rows}</div>;
  }
}

export default StubGroupList;
