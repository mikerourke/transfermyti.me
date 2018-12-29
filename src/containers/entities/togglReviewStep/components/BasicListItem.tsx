import React from 'react';
import { ListRowProps } from 'react-virtualized';
import get from 'lodash/get';
import { css } from 'emotion';
import { Box } from 'bloomer';
import { EntityModel } from '../../../../types/workspacesTypes';

interface Props extends ListRowProps {
  entityRecord: EntityModel;
}

const BasicListItem: React.FunctionComponent<Props> = ({
  entityRecord,
  isScrolling,
  isVisible,
  ...props
}) => (
  <div
    {...props}
    className={css`
      align-items: center;
      display: flex;
      justify-content: flex-start;
    `}
  >
    <Box
      className={css`
        align-items: center;
        display: flex;
        height: 48px;
        margin-left: 4px;
        padding-left: 8px;
        width: calc(100% - 16px);
      `}
    >
      {get(entityRecord, 'name')}
    </Box>
  </div>
);

export default BasicListItem;
