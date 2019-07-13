import React from "react";
import { Box } from "bloomer";
import { css } from "emotion";
import Flex from "~/components/flex/Flex";
import Checkbox from "~/components/checkbox/Checkbox";
import { CompoundWorkspaceModel } from "~/types";

interface Props {
  workspace: CompoundWorkspaceModel;
  onWorkspaceClick: (workspaceId: string) => void;
}

const WorkspaceRow: React.FC<Props> = ({
  workspace: { id, name, isIncluded },
  onWorkspaceClick,
}) => (
  <Box
    className={css`
      font-weight: bold;
      padding: 1rem;
    `}
  >
    <Flex alignItems="center">
      <Checkbox
        checked={isIncluded}
        size="1.5rem"
        onClick={() => onWorkspaceClick(id)}
      />
      <span
        className={css`
          margin-left: 0.75rem;
          font-size: 1.5rem;
        `}
      >
        {name}
      </span>
    </Flex>
  </Box>
);

export default WorkspaceRow;
