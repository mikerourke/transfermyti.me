import React from "react";
import { Box } from "bloomer";
import { Checkbox, Flex } from "~/components";
import { CompoundWorkspaceModel } from "~/workspaces/workspacesTypes";

interface Props {
  workspace: CompoundWorkspaceModel;
  onWorkspaceClick: (workspaceId: string) => void;
}

const WorkspaceRow: React.FC<Props> = ({
  workspace: { id, name, isIncluded },
  onWorkspaceClick,
}) => (
  <Box css={{ fontWeight: "bold", padding: "1rem" }}>
    <Flex alignItems="center">
      <Checkbox
        checked={isIncluded}
        size="1.5rem"
        onClick={() => onWorkspaceClick(id)}
      />
      <span css={{ marginLeft: "0.75rem", fontSize: "1.5rem" }}>{name}</span>
    </Flex>
  </Box>
);

export default WorkspaceRow;
