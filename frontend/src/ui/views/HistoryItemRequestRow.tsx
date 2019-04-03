import * as React from 'react';
import { HistoryItem } from 'Data/HistoryHolder';
import { Manager, Reference, Popper } from 'react-popper';
import RequestRow from 'UI/views/RequestRow';
import { Data } from 'popper.js';

export interface HistoryItemRequestRowProps {
  item: HistoryItem;
}

export interface HistoryItemRequestRowState {
  isExpanded: boolean;
}

export class HistoryItemRequestRow extends React.Component<HistoryItemRequestRowProps, HistoryItemRequestRowState> {

  constructor(props: HistoryItemRequestRowProps) {
    super(props);
    this.modifyStyle = this.modifyStyle.bind(this);
    this.state = {
      isExpanded: false,
    };
  }

  modifyStyle(style: React.CSSProperties): React.CSSProperties {
    const height = this.state.isExpanded ? '200px' : '55px';
    return { height, backgroundColor: 'lightyellow', overflow: 'scroll', ...style };
  }

  render() {
    const contentStyle = { width: '95%' };
    const arrowStyle = { left: '100px' };

    return <div className="history_request_row">
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
            <div ref={ref} style={ this.modifyStyle(style)} data-placement={placement}>
              <RequestRow
                key={this.props.item.id}
                request={this.props.item}
                isExpanded={this.state.isExpanded}
                onExpandedChanged={(isExpanded: boolean) => {
                  this.setState({
                    isExpanded,
                  });
                  scheduleUpdate();
                }}/>
              <div ref={arrowProps.ref} style={arrowProps.style} />
            </div>
          )}
        </Popper>
      </Manager>
    </div>;
  }
}


/*
<Popup
          trigger={open => (
            <div className="stub_group_add_button">Stub groups</div>
          )}
          closeOnDocumentClick={true}
          keepTooltipInside={true}
          position="top left"
          contentStyle={contentStyle}
          arrowStyle={arrowStyle}>
          <RequestRow
            key={this.props.item.id}
            request={this.props.item}
            isExpanded={false}/>
        </Popup>
*/