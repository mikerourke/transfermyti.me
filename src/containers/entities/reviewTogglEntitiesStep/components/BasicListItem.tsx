import React from 'react';
import { ListRowProps } from 'react-virtualized';
import get from 'lodash/get';
import { css } from 'emotion';
import { Box } from 'bloomer';
import { EntityModel } from '../../../../types/commonTypes';
import IncludedIndicator from '../../../../components/includedIndicator/IncludedIndicator';

interface Props extends ListRowProps {
  entityRecord: EntityModel;
  onItemClick: () => void;
}

// TODO: Add formatting to time entry count

const BasicListItem: React.FunctionComponent<Props> = ({
  entityRecord,
  onItemClick,
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
      <IncludedIndicator
        isIncluded={get(entityRecord, 'isIncluded')}
        size="1.25rem"
        onClick={onItemClick}
      />
      <span
        className={css`
          font-weight: 400;
          margin-left: 0.5rem;
        `}
      >
        {get(entityRecord, 'name')}
      </span>
      <span
        className={css`
          margin-left: 0.75rem;
        `}
      >
        ({get(entityRecord, 'entryCount', 0)} time entries)
      </span>
    </Box>
  </div>
);

export default BasicListItem;
