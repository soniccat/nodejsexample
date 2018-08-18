import * as React from 'react';
import { RequestViewer } from 'Components/RequestViewer';

export interface AppProps {
}

export class App extends React.Component<AppProps, {}> {
  render() {
    return <div>
      <RequestViewer />
    </div>;
  }
}
