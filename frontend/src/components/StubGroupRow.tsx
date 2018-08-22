import * as React from 'react';
import StubGroup from 'Model/StubGroup';

export interface StubGroupRowProps {
  stubGroup: StubGroup;
  isExpanded: boolean;
}

export interface StubGroupRowState {
  isExpanded: boolean;
}

export class StubGroupRow extends React.Component<StubGroupRowProps, StubGroupRowState> {
  constructor(props: StubGroupRowProps) {
    super(props);

    this.state = {
      isExpanded: props.isExpanded,
    };
  }

  render() {
    return <div className="stub_group_row">
    group
    {this.props.children}
    </div>;
  }
}

export default StubGroupRow;
