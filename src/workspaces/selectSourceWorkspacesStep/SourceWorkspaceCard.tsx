import * as R from "ramda";
import React from "react";
import { Card, styled, Toggle, WorkspaceSelect } from "~/components";
import { ToolAction, WorkspaceModel } from "~/typeDefs";

const WorkspaceToggle = styled(Toggle)({}, ({ theme }) => ({
  marginBottom: "0.5rem",
  marginTop: "0.5rem",
  background: theme.colors.secondary,

  "&:focus": {
    outlineColor: theme.colors.secondary,
  },
}));

const SectionHeader = styled.h3({
  marginBottom: "0.25rem",
  marginTop: "0.5rem",
});

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
    <Card title={sourceWorkspace.name} css={{ h2: { margin: 0 } }}>
      <hr css={{ width: "100%" }} />
      <SectionHeader id={titleId}>{actionTitle}</SectionHeader>
      <WorkspaceToggle
        aria-label={actionTitle}
        aria-labelledby={titleId}
        isToggled={sourceWorkspace.isIncluded}
        onToggle={handleToggleIncludeWorkspace}
      />
      {sourceWorkspace.isIncluded && targetWorkspaces.length !== 0 && (
        <>
          <SectionHeader>Target Workspace</SectionHeader>
          <div css={{ marginBottom: "0.5rem", position: "relative" }}>
            <WorkspaceSelect
              css={theme => ({
                background: theme.colors.secondary,
                fontSize: "1.125rem",
              })}
              workspaces={workspacesForSelect}
              value={targetSelectValue}
              onSelectWorkspace={handleSelectWorkspace}
            />
          </div>
        </>
      )}
    </Card>
  );
};

export default SourceWorkspaceCard;
