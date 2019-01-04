import React from 'react';
import { ListRowProps } from 'react-virtualized';
import { css } from 'emotion';
import { Box } from 'bloomer';
import { EntityModel } from '../../../../types/commonTypes';
import IncludedIndicator from '../../../../components/includedIndicator/IncludedIndicator';

interface Props extends ListRowProps {
  entityRecord: EntityModel;
  onItemClick: () => void;
}

const BasicListItem: React.FunctionComponent<Props> = ({
  entityRecord,
  onItemClick,
  isScrolling,
  isVisible,
  ...props
}) => {
  const { isIncluded, name, entryCount = 0 } = entityRecord as any;
  const entryLabel = entryCount === 1 ? 'entry' : 'entries';

  return (
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
          justify-content: space-between;
          margin-left: 0.5rem;
          padding: 0 1rem;
          width: calc(100% - 2rem);
        `}
      >
        <div
          className={css`
            display: flex;
            align-items: center;
          `}
        >
          <IncludedIndicator
            isIncluded={isIncluded}
            size="1.25rem"
            onClick={onItemClick}
          />
          <span
            className={css`
              font-weight: 400;
              margin-left: 0.5rem;
            `}
          >
            {name}
          </span>
        </div>
        <div>
          <strong>{entryCount}</strong> time {entryLabel}
        </div>
      </Box>
    </div>
  );
};

export default BasicListItem;
