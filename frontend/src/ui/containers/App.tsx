import * as React from 'react';
import { RequestViewer } from 'UI/containers/RequestViewer';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'Node/react-tabs/style/react-tabs';
import { StubGroupViewer } from 'UI/containers/StubGroupViewer';
import DataHolder from 'Data/DataHolder';
import SessionHolder from 'Data/SessionHolder';
import HistoryHolder from 'Data/HistoryHolder';
import { LogViewer } from 'UI/containers/LogViewer';

export interface AppProps {
}

export interface AppState {
  dataHolder: DataHolder;
  sessionHolder: SessionHolder;
  historyHolder: HistoryHolder;
}

export class App extends React.Component<AppProps, AppState> {
  constructor(props) {
    super(props);
    this.updateDataHolder = this.updateDataHolder.bind(this);

    const dataHolder = new AppDataHolder(this);
    const sessionHolder = new AppSessionHolder(this);
    const historyHolder = new AppHistoryHolder(this);

    this.state = {
      dataHolder,
      sessionHolder,
      historyHolder,
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

  updateHistoryHolder() {
    this.setState({
      historyHolder: this.state.historyHolder,
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
          <RequestViewer dataHolder={this.state.dataHolder}
            historyHolder={this.state.historyHolder}/>
        </TabPanel>
        <TabPanel>
          <StubGroupViewer dataHolder={this.state.dataHolder}
            sessionHolder={this.state.sessionHolder}
            historyHolder={this.state.historyHolder}/>
        </TabPanel>
      </Tabs>
      <LogViewer historyHolder={this.state.historyHolder}/>
    </div>;
  }
}

// Holder wrappers

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

class AppHistoryHolder extends HistoryHolder {
  component: App;

  constructor(component: App) {
    super();
    this.component = component;
  }

  onDataUpdated() {
    super.onDataUpdated();
    this.component.updateHistoryHolder();
  }
}
