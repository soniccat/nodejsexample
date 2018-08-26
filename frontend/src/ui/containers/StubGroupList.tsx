import * as React from 'react';
import Request from 'Model/Request';
import DataHolder from 'Data/DataHolder';
import Popup from 'reactjs-popup';

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
    return <div>test</div>
  }
}

export default StubGroupList;
