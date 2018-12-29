import React from 'react';
import omit from 'lodash/omit';
import startCase from 'lodash/startCase';
import { Tab, TabLink, TabList, Tabs } from 'bloomer';
import { EntityGroup } from '../../../../types/commonTypes';

interface Props {
  activeTab: EntityGroup;
  onTabClick: (entityGroup: EntityGroup) => void;
}

const EntityTabs: React.FunctionComponent<Props> = ({
  activeTab,
  onTabClick,
}) => {
  const validGroups = omit(EntityGroup, 'Workspaces', 'Users');
  return (
    <Tabs>
      <TabList>
        {Object.entries(validGroups).map(([key, value]) => (
          <Tab
            key={value}
            isActive={value === activeTab}
            onClick={() => onTabClick(value)}
          >
            <TabLink>{startCase(key)}</TabLink>
          </Tab>
        ))}
      </TabList>
    </Tabs>
  );
};

export default EntityTabs;
