import React from "react";
import Chip from "./Chip";
import Flex from "./Flex";

interface Props {
  groupName: string;
  entityCount: number;
}

const EntityListPanelTitle: React.FC<Props> = props => (
  <Flex alignItems="center">
    <Chip color="navy" css={{ marginRight: "0.75rem" }}>
      {props.entityCount}
    </Chip>
    {props.groupName}
  </Flex>
);

export default EntityListPanelTitle;
