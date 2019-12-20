import React from "react";
import { Tab, TabLink, TabList, Tabs } from "bloomer";
import { omit, startCase } from "lodash";
import { EntityGroup } from "~/commonTypes";

interface Props {
  activeTab: EntityGroup;
  onTabClick: (entityGroup: EntityGroup) => void;
}

const EntityTabs: React.FC<Props> = ({ activeTab, onTabClick }) => {
  const validGroups = omit(EntityGroup, "Workspaces", "UserGroups", "Users");
  const activeStyle = {
    borderBottomColor: "var(--info)",
    color: "var(--info)",
  };

  return (
    <Tabs isMarginless>
      <TabList>
        {Object.entries(validGroups).map(([key, value]) => (
          <Tab
            data-testid="entity-tab"
            key={value}
            css={{ fontWeight: 500 }}
            isActive={value === activeTab}
            onClick={(): void => onTabClick(value)}
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
