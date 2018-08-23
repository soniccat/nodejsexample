import * as React from 'react';
import { RequestViewer } from 'Components/RequestViewer';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'Node/react-tabs/style/react-tabs';
import { StubGroupViewer } from 'Components/StubGroupViewer';

export interface AppProps {
}

export class App extends React.Component<AppProps, {}> {
  render() {
    return <div>
      <Tabs forceRenderTabPanel={true}>
        <TabList>
          <Tab>Requests</Tab>
          <Tab>Stub Groups</Tab>
        </TabList>

        <TabPanel>
          <RequestViewer />
        </TabPanel>
        <TabPanel>
          <StubGroupViewer />
        </TabPanel>
      </Tabs>
    </div>;
  }
}
