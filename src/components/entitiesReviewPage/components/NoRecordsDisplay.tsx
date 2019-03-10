import React from 'react';
import { css } from 'emotion';
import { isNil } from 'lodash';
import { EntityGroup } from '~/types/commonTypes';

interface Props {
  activeEntityGroup: string;
  height: number;
}

const NoRecordsDisplay: React.FC<Props> = ({ activeEntityGroup, height }) => {
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
      No {entityGroupDisplay} found!
    </div>
  );
};

export default NoRecordsDisplay;
