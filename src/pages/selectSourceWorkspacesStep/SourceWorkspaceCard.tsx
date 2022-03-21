import * as R from "ramda";
import React from "react";

import { Card, styled, Toggle, WorkspaceSelect } from "~/components";
import { ToolAction, WorkspaceModel } from "~/typeDefs";

const StyledCard = styled(Card)`
  h2 {
    margin: 0;
  }

  hr {
    width: 100%;
  }

  h3 {
    margin-bottom: 0.25rem;
    margin-top: 0.5rem;
  }

  [role="switch"] {
    margin-bottom: 0.5rem;
    margin-top: 0.5rem;
    background-color: var(--color-secondary);
  }

  [role="switch"]:focus {
    outline-color: var(--color-secondary);
  }

  div {
    position: relative;
    margin-bottom: 0.5rem;
  }
`;

interface Props {
  sourceWorkspace: WorkspaceModel;
  targetWorkspaces: WorkspaceModel[];
  toolAction: ToolAction;
  onSelectTarget: (
    sourceWorkspace: WorkspaceModel,
    targetWorkspace: WorkspaceModel,
  ) => void;
  onToggleIncluded: (sourceWorkspace: WorkspaceModel) => void;
}

const SourceWorkspaceCard: React.FC<Props> = ({
  sourceWorkspace,
  targetWorkspaces,
  ...props
}) => {
  const titleId = `include-toggle-${sourceWorkspace.id}`;
  const targetWorkspace = targetWorkspaces.find(
    ({ id }) => id === sourceWorkspace.linkedId,
  );
  const targetSelectValue = R.isNil(targetWorkspace)
    ? undefined
    : targetWorkspace.id;

  const workspacesForSelect = [...targetWorkspaces];
  const matchingNameWorkspace = targetWorkspaces.find(
    ({ name }) => name.toLowerCase() === sourceWorkspace.name.toLowerCase(),
  );

  // Don't allow the user to pick the "Create New" option if a workspace with
  // a matching name exists on the target:
  if (!matchingNameWorkspace) {
    workspacesForSelect.unshift({
      id: "",
      name: "None (Create New)",
    } as WorkspaceModel);
  }

  const actionTitle =
    props.toolAction === ToolAction.Delete
      ? "Include in Deletion?"
      : "Include in Transfer?";

  const handleToggleIncludeWorkspace = (): void => {
    props.onToggleIncluded(sourceWorkspace);
    if (matchingNameWorkspace && !sourceWorkspace.isIncluded) {
      props.onSelectTarget(sourceWorkspace, matchingNameWorkspace);
    }
  };

  const handleSelectWorkspace = (workspace: WorkspaceModel): void => {
    props.onSelectTarget(sourceWorkspace, workspace);
  };

  return (
    <StyledCard title={sourceWorkspace.name}>
      <hr />

      <h3 id={titleId}>{actionTitle}</h3>

      <Toggle
        aria-label={actionTitle}
        aria-labelledby={titleId}
        isToggled={sourceWorkspace.isIncluded}
        onToggle={handleToggleIncludeWorkspace}
      />

      {sourceWorkspace.isIncluded && targetWorkspaces.length !== 0 && (
        <>
          <h3>Target Workspace</h3>

          <div>
            <WorkspaceSelect
              style={{
                backgroundColor: "var(--color-secondary)",
                fontSize: "1.125rem",
              }}
              workspaces={workspacesForSelect}
              value={targetSelectValue}
              onSelectWorkspace={handleSelectWorkspace}
            />
          </div>
        </>
      )}
    </StyledCard>
  );
};

export default SourceWorkspaceCard;
