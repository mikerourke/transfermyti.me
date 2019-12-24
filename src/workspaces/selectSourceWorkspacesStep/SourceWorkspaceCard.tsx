import React from "react";
import { FlexboxGrid, Panel, Toggle } from "rsuite";
import { WorkspaceModel } from "~/workspaces/workspacesTypes";

interface Props {
  workspace: WorkspaceModel;
  onToggleIncluded: (workspaceId: string) => void;
}

const SourceWorkspaceCard: React.FC<Props> = props => (
  <FlexboxGrid.Item css={{ margin: "0 1rem 1rem", flex: "0 0 16rem" }}>
    <Panel bordered>
      <h3 css={{ marginBottom: "1rem" }}>{props.workspace.name}</h3>
      <div css={{ fontWeight: "bold", marginBottom: "0.375rem" }}>
        Transfer this workspace?
      </div>
      <Toggle
        size="md"
        checkedChildren="Yes"
        unCheckedChildren="No"
        checked={props.workspace.isIncluded}
        onChange={() => props.onToggleIncluded(props.workspace.id)}
      />
    </Panel>
  </FlexboxGrid.Item>
);

export default SourceWorkspaceCard;
