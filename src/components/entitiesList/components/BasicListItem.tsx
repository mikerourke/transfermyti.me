import React from 'react';
import { ListRowProps } from 'react-virtualized';
import { When } from 'react-if';
import { Box } from 'bloomer';
import { css } from 'emotion';
import { isNil } from 'lodash';
import Flex from '~/components/flex/Flex';
import Checkbox from '~/components/checkbox/Checkbox';
import { CheckedState, EntityModel } from '~/types/commonTypes';

interface Props extends ListRowProps {
  entityRecord: EntityModel;
  onItemClick?: () => void;
}

const BasicListItem: React.FC<Props> = ({
  entityRecord,
  onItemClick,
  isScrolling,
  isVisible,
  ...flexProps
}) => {
  const { isIncluded, name, entryCount = 0 } = entityRecord as any;
  const entryLabel = entryCount === 1 ? 'entry' : 'entries';
  const hasClickEvent = !isNil(onItemClick);

  return (
    <Flex {...flexProps} alignItems="center" justifyContent="flex-start">
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
          <When condition={hasClickEvent}>
            <Checkbox
              state={isIncluded ? CheckedState.Checked : CheckedState.Unchecked}
              size="1.25rem"
              onClick={hasClickEvent ? onItemClick : undefined}
            />
          </When>
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
