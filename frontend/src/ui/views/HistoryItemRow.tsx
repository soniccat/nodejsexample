import * as React from 'react';
import { HistoryItem } from 'Data/HistoryHolder';
import RequestRow from 'UI/views/RequestRow';

export interface HistoryItemRowProps {
  item: HistoryItem;
}

export interface HistoryItemRowState {
}

export class HistoryItemRow extends React.Component<HistoryItemRowProps, HistoryItemRowState> {

  constructor(props: HistoryItemRowProps) {
    super(props);

    this.state = {
    };
  }

  render() {
    return <div className="history_row">
      <RequestRow 
            key={this.props.item.id}
            request={this.props.item}
            isExpanded={false}
      />
    </div>;
  }
}
