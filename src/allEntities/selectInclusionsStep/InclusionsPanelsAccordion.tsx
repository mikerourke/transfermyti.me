import React from "react";

import ClientsInclusionsPanel from "~/clients/clientsInclusionsPanel/ClientsInclusionsPanel";
import { Accordion } from "~/components";
import ProjectsInclusionsPanel from "~/projects/projectsInclusionsPanel/ProjectsInclusionsPanel";
import TagsInclusionsPanel from "~/tags/tagsInclusionsPanel/TagsInclusionsPanel";
import TasksInclusionsPanel from "~/tasks/tasksInclusionsPanel/TasksInclusionsPanel";
import TimeEntriesInclusionsPanel from "~/timeEntries/timeEntriesInclusionsPanel/TimeEntriesInclusionsPanel";

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
