import React from "react";
import { styled } from "./emotion";
import { WorkspaceModel } from "~/typeDefs";

const Select = styled.select(
  {
    appearance: "none",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    display: "inline-block",
    fontSize: "1rem",
    marginTop: "0.5rem",
    padding: "0.75rem 1rem",
    width: "100%",
  },
  ({ theme }) => ({
    background: theme.colors.white,
    boxShadow: theme.elevation.dp2,
    color: theme.colors.primary,
  }),
);

const Arrow = styled.span(
  {
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderStyle: "solid",
    borderWidth: "0.5rem 0.5rem 0",
    bottom: "1.125rem",
    height: 0,
    pointerEvents: "none",
    position: "absolute",
    right: "1.5rem",
    width: 0,
  },
  ({ theme }) => ({
    borderTopColor: theme.colors.midnight,
  }),
);

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
    <>
      <Select
        data-testid="workspace-select"
        value={value}
        onChange={handleSelectChange}
        {...props}
      >
        {workspaces.map(workspace => (
          <option
            key={workspace.id}
            label={workspace.name}
            value={workspace.id}
          >
            {workspace.name}
          </option>
        ))}
      </Select>
      <Arrow />
    </>
  );
};

export default WorkspaceSelect;
