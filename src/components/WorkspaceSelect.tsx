import React from "react";

import type { WorkspaceModel } from "~/typeDefs";

import { styled } from "./emotion";

const StyledDiv = styled.div`
  position: relative;

  select {
    display: inline-block;
    width: 100%;
    margin-top: 0.5rem;
    padding: 0.75rem 1rem;
    appearance: none;
    font-size: 1rem;
    border: none;
    border-radius: 0.375rem;
    background-color: var(--color-white);
    box-shadow: var(--elevation-dp2);
    color: var(--color-primary);
    cursor: pointer;
  }

  span {
    position: absolute;
    bottom: 1.125rem;
    right: 1.5rem;
    height: 0;
    width: 0;
    border-color: var(--color-midnight) transparent transparent;
    border-style: solid;
    border-width: 0.5rem 0.5rem 0;
    pointer-events: none;
  }
`;

interface Props extends React.HTMLProps<HTMLSelectElement> {
  workspaces: WorkspaceModel[];
  onSelectWorkspace: (workspace: WorkspaceModel) => void;
}

const WorkspaceSelect: React.FC<Props> = ({
  workspaces,
  value,
  onSelectWorkspace,
  ...props
}) => {
  const handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const workspace = workspaces.find(({ id }) => id === event.target.value);
    onSelectWorkspace(workspace as WorkspaceModel);
  };

  return (
    <StyledDiv>
      <select
        data-testid="workspace-select"
        value={value}
        onChange={handleSelectChange}
        {...props}
      >
        {workspaces.map((workspace) => (
          <option
            key={workspace.id}
            label={workspace.name}
            value={workspace.id}
          >
            {workspace.name}
          </option>
        ))}
      </select>

      <span />
    </StyledDiv>
  );
};

export default WorkspaceSelect;
