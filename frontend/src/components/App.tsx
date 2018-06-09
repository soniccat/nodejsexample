import * as React from 'react';
import * as RequestViewer from 'Components/RequestViewer';

export interface AppProps { compiler: string; framework: string; }

export class App extends React.Component<AppProps, {}> {
  render() {
    return <div>
      Hello from {this.props.compiler} and {this.props.framework}!
    </div>;
  }
}
