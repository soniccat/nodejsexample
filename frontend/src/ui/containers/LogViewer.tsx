import * as React from 'react';
import { StubGroupRowRefDictType } from 'Utils/types';
import HistoryHolder from 'Data/HistoryHolder';
import { HistoryItemRequestRow } from 'UI/views/HistoryItemRequestRow';

import 'CSS/LogViewer';

export interface LogViewerProps {
  historyHolder: HistoryHolder;
}

export interface LogViewerState {
}

export class LogViewer extends React.Component<LogViewerProps, LogViewerState> {
  rowRefs: StubGroupRowRefDictType = {};

  constructor(props: LogViewerProps) {
    super(props);
    this.state = {
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
      />));

    this.rowRefs = newRefs;

    return (
      <div className="log_viewer">
        {rows}
      </div>
    );
  }
}
