import React from "react";
import { If, Then, Else } from "react-if";
import styled from "@emotion/styled";
import { lookupTable } from "~/utils";
import { EntityGroup, ToolName } from "~/commonTypes";

const Root = styled.div<{ height: number }>(
  {
    textAlign: "center",
    fontSize: "2.5rem",
    fontWeight: 500,
  },
  ({ height }) => ({
    height,
    paddingTop: Math.ceil(height / 4),
  }),
);

interface Props {
  activeEntityGroup: string;
  height: number;
  toolName: ToolName;
}

const NoRecordsDisplay: React.FC<Props> = ({
  activeEntityGroup,
  height,
  toolName,
}) => {
  const entityGroupDisplay = lookupTable(activeEntityGroup, {
    [EntityGroup.TimeEntries]: "time entries",
    [EntityGroup.UserGroups]: "user groups",
    default: activeEntityGroup,
  });

  return (
    <Root data-testid="no-records-display" height={height}>
      <If condition={toolName === ToolName.Toggl}>
        <Then>No {entityGroupDisplay} found!</Then>
        <Else>No {entityGroupDisplay} to transfer!</Else>
      </If>
    </Root>
  );
};

export default NoRecordsDisplay;
