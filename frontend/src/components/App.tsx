import * as React from 'react';
import Request from 'Model/Request';
import { RequestViewer } from 'Components/RequestViewer';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'Node/react-tabs/style/react-tabs';
import { StubGroupViewer } from 'Components/StubGroupViewer';
import DataHolder from 'Data/DataHolder';
import StubGroup from 'Model/StubGroup';
import { LoadRequestsOption } from 'Model/LoadRequestsOption';

export interface AppProps {
}

export interface AppState {
  dataHolder: DataHolder;
}

class AppDataHolder extends DataHolder {
  component: App;

  constructor(component: App) {
    super();
    this.component = component;
  }

  onRequestsUpdated() {
    super.onRequestsUpdated();
    this.component.updateHolder();
  }

  onRequestErrorUpdated() {
    super.onRequestErrorUpdated();
    this.component.updateHolder();
  }
}

export class App extends React.Component<AppProps, AppState> {
  constructor(props) {
    super(props);

    this.updateHolder = this.updateHolder.bind(this);
    this.onStubGroupsUpdated = this.onStubGroupsUpdated.bind(this);

    const dataHolder = new AppDataHolder(this);
    this.state = {
      dataHolder,
    };
  }

  updateHolder() {
    this.setState({
      dataHolder: this.state.dataHolder,
    });
  }

  onStubGroupsUpdated(stubGroups: StubGroup[]) {
    const holder = this.state.dataHolder;
    holder.setStubGroups(stubGroups);

    this.setState({
      dataHolder: holder,
    });
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
          <StubGroupViewer dataHolder={this.state.dataHolder}/>
        </TabPanel>
      </Tabs>
    </div>;
  }
}
