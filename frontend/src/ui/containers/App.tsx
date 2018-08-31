import * as React from 'react';
import { RequestViewer } from 'UI/containers/RequestViewer';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'Node/react-tabs/style/react-tabs';
import { StubGroupViewer } from 'UI/containers/StubGroupViewer';
import DataHolder from 'Data/DataHolder';
import SessionHolder from 'Data/SessionHolder';

export interface AppProps {
}

export interface AppState {
  dataHolder: DataHolder;
  sessionHolder: SessionHolder;
}

class AppDataHolder extends DataHolder {
  component: App;

  constructor(component: App) {
    super();
    this.component = component;
  }

  onDataUpdated() {
    super.onDataUpdated();
    this.component.updateDataHolder();
  }
}

class AppSessionHolder extends SessionHolder {
  component: App;

  constructor(component: App) {
    super();
    this.component = component;
  }

  onDataUpdated() {
    super.onDataUpdated();
    this.component.updateSessionHolder();
  }
}

export class App extends React.Component<AppProps, AppState> {
  constructor(props) {
    super(props);
    this.updateDataHolder = this.updateDataHolder.bind(this);

    const dataHolder = new AppDataHolder(this);
    const sessionHolder = new AppSessionHolder(this);

    this.state = {
      dataHolder,
      sessionHolder,
    };
  }

  updateDataHolder() {
    this.setState({
      dataHolder: this.state.dataHolder,
    });
  }

  updateSessionHolder() {
    this.setState({
      sessionHolder: this.state.sessionHolder,
    });
  }

  componentDidMount() {
    this.state.sessionHolder.loadInfo();
  }

  render() {
    return <div>
      <Tabs forceRenderTabPanel={true}>
        <TabList>
          <Tab>Requests</Tab>
          <Tab>Stub Groups</Tab>
        </TabList>

        <TabPanel>
          <RequestViewer dataHolder={this.state.dataHolder}/>
        </TabPanel>
        <TabPanel>
          <StubGroupViewer dataHolder={this.state.dataHolder} sessionHolder={this.state.sessionHolder}/>
        </TabPanel>
      </Tabs>
    </div>;
  }
}
