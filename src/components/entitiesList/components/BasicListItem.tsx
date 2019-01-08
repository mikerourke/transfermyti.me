import React from 'react';
import { ListRowProps } from 'react-virtualized';
import { Box } from 'bloomer';
import { css } from 'emotion';
import isNil from 'lodash/isNil';
import noop from 'lodash/noop';
import Flex from '../../flex/Flex';
import IncludedIndicator from '../../includedIndicator/IncludedIndicator';
import ShowIf from '../../showIf/ShowIf';
import { EntityModel } from '../../../types/commonTypes';

interface Props extends ListRowProps {
  entityRecord: EntityModel;
  onItemClick?: () => void;
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
    <Flex {...props} alignItems="center" justifyContent="flex-start">
      <Flex
        as={Box}
        alignItems="center"
        justifyContent="space-between"
        className={css`
          height: 48px;
          margin-left: 0.5rem;
          padding: 0 1rem;
          width: calc(100% - 2rem);
        `}
      >
        <Flex alignItems="center">
          <ShowIf
            as={IncludedIndicator}
            isShown={!isNil(onItemClick)}
            isIncluded={isIncluded}
            size="1.25rem"
            onClick={isNil(onItemClick) ? noop : onItemClick}
          />
          <span
            className={css`
              font-weight: 400;
              margin-left: 0.5rem;
            `}
          >
            {name}
          </span>
        </Flex>
        <div>
          <strong>{entryCount}</strong> time {entryLabel}
        </div>
      </Flex>
    </Flex>
  );
};

export default BasicListItem;
