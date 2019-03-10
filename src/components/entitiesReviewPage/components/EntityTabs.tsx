import React from 'react';
import { Tab, TabLink, TabList, Tabs } from 'bloomer';
import { css } from 'emotion';
import { omit, startCase } from 'lodash';
import { EntityGroup } from '~/types/commonTypes';

interface Props {
  activeTab: EntityGroup;
  onTabClick: (entityGroup: EntityGroup) => void;
}

const EntityTabs: React.FC<Props> = ({ activeTab, onTabClick }) => {
  const validGroups = omit(EntityGroup, 'Workspaces');
  const activeStyle = {
    borderBottomColor: 'var(--info)',
    color: 'var(--info)',
  };

  return (
    <Tabs>
      <TabList>
        {Object.entries(validGroups).map(([key, value]) => (
          <Tab
            key={value}
            className={css`
              font-weight: 500;
            `}
            isActive={value === activeTab}
            onClick={() => onTabClick(value)}
          >
            <TabLink style={value === activeTab ? activeStyle : {}}>
              {startCase(key)}
            </TabLink>
          </Tab>
        ))}
      </TabList>
    </Tabs>
  );
};

export default EntityTabs;
