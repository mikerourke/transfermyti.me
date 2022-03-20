import React from "react";

import { Accordion } from "~/components";
import ClientsInclusionsPanel from "~/pages/selectInclusionsStep/ClientsInclusionsPanel";
import ProjectsInclusionsPanel from "~/pages/selectInclusionsStep/ProjectsInclusionsPanel";
import TagsInclusionsPanel from "~/pages/selectInclusionsStep/TagsInclusionsPanel";
import TasksInclusionsPanel from "~/pages/selectInclusionsStep/TasksInclusionsPanel";
import TimeEntriesInclusionsPanel from "~/pages/selectInclusionsStep/TimeEntriesInclusionsPanel";

const InclusionsPanelsAccordion: React.FC = () => (
  <>
    <h2>Workspace Records</h2>
    <Accordion css={{ marginBottom: "2rem" }}>
      <ClientsInclusionsPanel />
      <TagsInclusionsPanel />
      <ProjectsInclusionsPanel />
      <TasksInclusionsPanel />
      <TimeEntriesInclusionsPanel />
    </Accordion>
  </>
);

export default InclusionsPanelsAccordion;
