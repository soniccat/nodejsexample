import * as React from 'react';
import { StubGroupRowRefDictType } from 'Utils/types';
import HistoryHolder from 'Data/HistoryHolder';
import { HistoryItemRequestRow } from 'UI/views/HistoryItemRequestRow';

import 'CSS/LogViewer';

export interface LogViewerProps {
  historyHolder: HistoryHolder;
}

export interface LogViewerState {
  selectedIndex: number;
}

export class LogViewer extends React.Component<LogViewerProps, LogViewerState> {
  rowRefs: StubGroupRowRefDictType = {};

  constructor(props: LogViewerProps) {
    super(props);
    this.state = {
      selectedIndex: -1,
    };
  }

  // Events

  componentDidMount() {
  }

  render() {
    const newRefs: StubGroupRowRefDictType = {};
    const items = this.props.historyHolder.items ? this.props.historyHolder.items : [];
    const rows = items.map((item, i) => (<HistoryItemRequestRow
      key={i}
      item={item}
      isSelected={i === this.state.selectedIndex}
      onClicked={() => {
        this.setState({
          selectedIndex: i !== this.state.selectedIndex ? i : -1,
        });
      }}
      />));

    this.rowRefs = newRefs;

    return (
      <div className="log_viewer">
        {rows}
      </div>
    );
  }
}
