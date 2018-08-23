import * as React from 'react';
import 'CSS/ExpandButton';

interface ExpandButtonProp {
  className: string;
  isExpanded: boolean;
  onClick?: () => void;
}

export default class ExpandButton extends React.PureComponent<ExpandButtonProp> {
  constructor(props: ExpandButtonProp) {
    super(props);
  }

  render() {
    return <div role="button"
        tabIndex={0}
        className={`${this.props.className ? this.props.className : ''} expand_button`}
        onClick={this.props.onClick}>
          {this.props.isExpanded ? '-' : '+'}
      </div>;
  }
}
