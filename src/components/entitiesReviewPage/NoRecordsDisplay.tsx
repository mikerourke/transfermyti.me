import React from "react";
import { If, Then, Else } from "react-if";
import { css } from "emotion";
import { isNil } from "lodash";
import { EntityGroup, ToolName } from "~/types";

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
  let entityGroupDisplay = {
    [EntityGroup.TimeEntries]: "time entries",
    [EntityGroup.UserGroups]: "user groups",
  }[activeEntityGroup];
  if (isNil(entityGroupDisplay)) {
    entityGroupDisplay = activeEntityGroup;
  }

  return (
    <div
      data-testid="no-records-display"
      className={css({
        height,
        textAlign: "center",
        paddingTop: Math.ceil(height / 4),
        fontSize: "2.5rem",
        fontWeight: 500,
      })}
    >
      <If condition={toolName === ToolName.Toggl}>
        <Then>No {entityGroupDisplay} found!</Then>
        <Else>No {entityGroupDisplay} to transfer!</Else>
      </If>
    </div>
  );
};

export default NoRecordsDisplay;
