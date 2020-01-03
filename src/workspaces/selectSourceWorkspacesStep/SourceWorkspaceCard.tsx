import React from "react";
import { Card, Toggle } from "~/components";
import { WorkspaceModel } from "~/workspaces/workspacesTypes";

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
    <span id={`${workspace.id}Transfer`}>Transfer this workspace?</span>
    <Toggle
      aria-label="Include workspace in transfer"
      aria-labelledby={`${workspace.id}Transfer`}
      css={{ marginTop: "0.375rem" }}
      isToggled={workspace.isIncluded}
      onToggle={() => onToggleIncluded(workspace)}
    />
  </Card>
);

export default SourceWorkspaceCard;
