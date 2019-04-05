import * as React from 'react';
import { StubGroupRowRefDictType } from 'Utils/types';
import HistoryHolder from 'Data/HistoryHolder';
import { HistoryItemRequestRow } from 'UI/views/HistoryItemRequestRow';
import Request from 'Model/Request';
import { Manager, Reference, Popper } from 'react-popper';
import RequestRow from 'UI/views/RequestRow';

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
    this.modifyStyle = this.modifyStyle.bind(this);
    this.createRequestPopup = this.createRequestPopup.bind(this);
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
      <Manager>
        <div className="log_viewer">
          {rows}
        </div>
        <Popper placement="top-start" modifiers={{preventOverflow : {
          enabled: true,
          escapeWithReference: true,
        }}}>
          {({ ref, style, placement, arrowProps, scheduleUpdate }) => (
            <div ref={ref} style={ this.modifyStyle(style)} data-placement={placement} onClick={(e) => {
              e.stopPropagation();
              scheduleUpdate();
            }}>
              {this.state.selectedIndex !== -1 ? this.createRequestPopup() : undefined}
              <div ref={arrowProps.ref} style={arrowProps.style} />
            </div>
          )}
        </Popper>
      </Manager>
    );
  }

  modifyStyle(style: React.CSSProperties): React.CSSProperties {
    return { maxHeight: '200px',
      backgroundColor: 'lightyellow',
      overflow: 'scroll',
      background: 'rgb(255, 255, 255)',
      border: '1px solid rgb(187, 187, 187)',
      boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 3px',
      visibility: this.state.selectedIndex !== -1 ? 'visible' : 'hidden',
      ...style };
  }

  private createRequestPopup() {
    return <RequestRow
      key="poupKey"
      request={this.props.historyHolder.items[this.state.selectedIndex]}
      isExpanded={true}/>;
  }

  private createRequestItem(i: number, item: Request): JSX.Element {
    const historyItem = <HistoryItemRequestRow key={i} item={item} isSelected={i === this.state.selectedIndex} onClicked={() => {
      this.setState({
        selectedIndex: i !== this.state.selectedIndex ? i : -1,
      });
    }}/>;

    return i === this.state.selectedIndex ? this.wrapInReference(i, historyItem) : historyItem;
  }

  private wrapInReference(key: number, element: JSX.Element) {
    return <Reference key={key}>
    {({ ref }) => (
      <div ref={ref}>
        { element }
      </div>
    )}
    </Reference>;
  }

  private createStringItem(i: number, item: String): JSX.Element {
    return <div key={i}>
      {item}
    </div>;
  }
}
