import * as React from 'react';
import Request from 'Model/Request';
import DataHolder from 'Data/DataHolder';

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

  render() {
    const stubGroups = this.props.dataHolder.stubGroups ? this.props.dataHolder.stubGroups : [];
    const rows = stubGroups.map((stub) => {
      return <div key={stub.id}>{stub.name}</div>;
    });

    return <div>{rows}</div>;
  }
}

export default StubGroupList;
