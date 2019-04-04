import * as React from 'react';
import { StubGroupRowRefDictType } from 'Utils/types';
import HistoryHolder from 'Data/HistoryHolder';
import { HistoryItemRequestRow } from 'UI/views/HistoryItemRequestRow';
import Request from 'Model/Request';

import 'CSS/LogViewer';
import { isString } from 'util';

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
    const rows = items.map((item, i) => {
      if (Request.checkType(item)) {
        return this.createRequestItem(i, item);
      }

      if (isString(item)) {
        return this.createStringItem(i, item);
      }
    });

    this.rowRefs = newRefs;

    return (
      <div className="log_viewer">
        {rows}
      </div>
    );
  }

  private createRequestItem(i: number, item: Request): JSX.Element {
    return <HistoryItemRequestRow key={i} item={item} isSelected={i === this.state.selectedIndex} onClicked={() => {
      this.setState({
        selectedIndex: i !== this.state.selectedIndex ? i : -1,
      });
    } } />;
  }

  private createStringItem(i: number, item: String): JSX.Element {
    return <div key={i}>
      {item}
    </div>;
  }
}
