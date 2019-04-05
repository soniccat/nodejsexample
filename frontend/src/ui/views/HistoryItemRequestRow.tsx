import * as React from 'react';
import Request from 'Model/Request';

export interface HistoryItemRequestRowProps {
  item: Request;
  isSelected: boolean;
  onClicked: () => void;
}

export interface HistoryItemRequestRowState {
}

export class HistoryItemRequestRow extends React.PureComponent<HistoryItemRequestRowProps, HistoryItemRequestRowState> {

  constructor(props: HistoryItemRequestRowProps) {
    super(props);
    this.state = {
    };
  }

  render() {
    return <div className="history_request_row" onClick={() => {
      this.props.onClicked();
    }}>
      {`${this.props.item.method} ${this.props.item.url} ${this.props.item.responseStatus}`}
    </div>;
  }
}
