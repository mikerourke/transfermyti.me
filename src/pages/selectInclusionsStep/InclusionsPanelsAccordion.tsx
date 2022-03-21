import React from "react";

import { styled } from "~/components";
import ClientsInclusionsPanel from "~/pages/selectInclusionsStep/ClientsInclusionsPanel";
import ProjectsInclusionsPanel from "~/pages/selectInclusionsStep/ProjectsInclusionsPanel";
import TagsInclusionsPanel from "~/pages/selectInclusionsStep/TagsInclusionsPanel";
import TasksInclusionsPanel from "~/pages/selectInclusionsStep/TasksInclusionsPanel";
import TimeEntriesInclusionsPanel from "~/pages/selectInclusionsStep/TimeEntriesInclusionsPanel";

const StyledSection = styled.section`
  margin-bottom: 2rem;
`;

const InclusionsPanelsAccordion: React.FC = () => (
  <>
    <h2>Workspace Records</h2>
    <StyledSection>
      <div role="presentation">
        <ClientsInclusionsPanel />
        <TagsInclusionsPanel />
        <ProjectsInclusionsPanel />
        <TasksInclusionsPanel />
        <TimeEntriesInclusionsPanel />
      </div>
    </StyledSection>
  </>
);

export default InclusionsPanelsAccordion;
