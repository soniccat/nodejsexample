import * as React from 'react';
import { StubGroupRowRefDictType } from 'Utils/types';
import HistoryHolder from 'Data/HistoryHolder';
import { HistoryItemRow } from 'UI/views/HistoryItemRow';

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
    const stubGroups = this.props.historyHolder.items ? this.props.historyHolder.items : [];
    const rows = stubGroups.map(group => (<HistoryItemRow
      key={group.id}
      item={group}
      />));

    this.rowRefs = newRefs;

    return (
      <div className="log_viewer">
        {rows}
      </div>
    );
  }
}
