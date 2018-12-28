import React from 'react';
import startCase from 'lodash/startCase';
import drop from 'lodash/drop';
import { Tab, TabLink, TabList, Tabs } from 'bloomer';
import { EntityGroup } from '../../../../types/commonTypes';

interface State {
  activeTab: EntityGroup;
}

class EntityTabs extends React.Component<any, State> {
  state = {
    activeTab: EntityGroup.Projects,
  };

  private handleTabClick = (tabEntity: EntityGroup) => () => {
    this.setState({ activeTab: tabEntity });
  };

  public render() {
    return (
      <Tabs>
        <TabList>
          {drop(Object.entries(EntityGroup)).map(([key, value]) => (
            <Tab
              key={value}
              isActive={value === this.state.activeTab}
              onClick={this.handleTabClick(value)}
            >
              <TabLink>{startCase(key)}</TabLink>
            </Tab>
          ))}
        </TabList>
      </Tabs>
    );
  }
}

export default EntityTabs;
