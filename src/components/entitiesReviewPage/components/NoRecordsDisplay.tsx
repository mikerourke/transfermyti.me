import React from 'react';
import { If, Then, Else } from 'react-if';
import { css } from 'emotion';
import { isNil } from 'lodash';
import { ToolName } from '~/types/commonTypes';
import { EntityGroup } from '~/types/entityTypes';

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
    [EntityGroup.TimeEntries]: 'time entries',
    [EntityGroup.UserGroups]: 'user groups',
  }[activeEntityGroup];
  if (isNil(entityGroupDisplay)) entityGroupDisplay = activeEntityGroup;

  return (
    <div
      className={css`
        height: ${height}px;
        text-align: center;
        padding-top: ${Math.ceil(height / 4)}px;
        font-size: 2.5rem;
        font-weight: 500;
      `}
    >
      <If condition={toolName === ToolName.Toggl}>
        <Then>No {entityGroupDisplay} found!</Then>
        <Else>No {entityGroupDisplay} to transfer!</Else>
      </If>
    </div>
  );
};

export default NoRecordsDisplay;
