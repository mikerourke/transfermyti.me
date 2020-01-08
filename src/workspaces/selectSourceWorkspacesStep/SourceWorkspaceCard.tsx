import React from "react";
import { Card, styled, Toggle } from "~/components";
import { WorkspaceModel } from "~/workspaces/workspacesTypes";

const WorkspaceToggle = styled(Toggle)({}, ({ theme }) => ({
  marginTop: "0.5rem",
  background: theme.colors.secondary,
}));

interface Props {
  workspace: WorkspaceModel;
  onToggleIncluded: (workspace: WorkspaceModel) => void;
}

const SourceWorkspaceCard: React.FC<Props> = ({
  workspace,
  onToggleIncluded,
  ...props
}) => (
  <Card title={workspace.name} {...props}>
    <div id={`${workspace.id}IncludeToggle`}>Include this workspace?</div>
    <WorkspaceToggle
      aria-label="Include this workspace"
      aria-labelledby={`${workspace.id}IncludeToggle`}
      isToggled={workspace.isIncluded}
      onToggle={() => onToggleIncluded(workspace)}
    />
  </Card>
);

export default SourceWorkspaceCard;
