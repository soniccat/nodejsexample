import * as React from 'react';
import { Manager, Reference, Popper } from 'react-popper';
import RequestRow from 'UI/views/RequestRow';
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
    this.modifyStyle = this.modifyStyle.bind(this);
    this.state = {
    };
  }

  modifyStyle(style: React.CSSProperties): React.CSSProperties {
    return { maxHeight: '200px',
      backgroundColor: 'lightyellow',
      overflow: 'scroll',
      background: 'rgb(255, 255, 255)',
      border: '1px solid rgb(187, 187, 187)',
      boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 3px',
      visibility: this.props.isSelected ? 'visible' : 'hidden',
      ...style };
  }

  render() {
    return <div className="history_request_row" onClick={() => {
      this.props.onClicked();
    }}>
      <Manager>
        <Reference>
          {({ ref }) => (
            <div ref={ref}>
              {`${this.props.item.method} ${this.props.item.url} ${this.props.item.responseStatus}`}
            </div>
          )}
        </Reference>
        <Popper placement="top-start">
          {({ ref, style, placement, arrowProps, scheduleUpdate }) => (
            <div ref={ref} style={ this.modifyStyle(style)} data-placement={placement} onClick={(e) => {
              e.stopPropagation();
              scheduleUpdate();
            }}>
              <RequestRow
                key={this.props.item.id}
                request={this.props.item}
                isExpanded={true}/>
              <div ref={arrowProps.ref} style={arrowProps.style} />
            </div>
          )}
        </Popper>
      </Manager>
    </div>;
  }
}
