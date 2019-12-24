import React from "react";
import { PanelGroup, Panel } from "rsuite";

export const SelectSourceInclusionsComponent: React.FC = props => {
  return (
    <PanelGroup accordion bordered>
      <Panel header="Projects" defaultExpanded>
        Projects
      </Panel>
      <Panel header="Clients">Clients</Panel>
      <Panel header="Tags">Tags</Panel>
      <Panel header="Tasks">Tasks</Panel>
      <Panel header="Time Entries">Time Entries</Panel>
    </PanelGroup>
  );
};

export default SelectSourceInclusionsComponent;
