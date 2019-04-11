import React from 'react';
import { ListRowProps } from 'react-virtualized';
import { When } from 'react-if';
import { css } from 'emotion';
import { isNil } from 'lodash';
import Checkbox from '~/components/checkbox/Checkbox';
import Flex from '~/components/flex/Flex';
import ListItemBase from './ListItemBase';
import EntityTagsRow from './EntityTagsRow';
import { EntityModel } from '~/types/commonTypes';

interface Props extends ListRowProps {
  entityRecord: EntityModel;
  isOmitted: boolean;
  onItemClick?: () => void;
}

const BasicListItem: React.FC<Props> = ({
  entityRecord,
  isOmitted,
  onItemClick,
  isScrolling,
  isVisible,
  ...listRowProps
}) => {
  const { name, isIncluded, entryCount = 0 } = entityRecord;

  const entryLabel = entryCount === 1 ? 'entry' : 'entries';
  const hasClickEvent = !isNil(onItemClick);

  return (
    <ListItemBase
      height={48}
      isOmitted={isOmitted}
      className={css`
        justify-content: space-between;
      `}
      {...listRowProps}
    >
      <Flex alignItems="center">
        <When condition={hasClickEvent}>
          <Checkbox
            checked={isIncluded}
            size="1.25rem"
            onClick={hasClickEvent ? onItemClick : undefined}
          />
        </When>
        <span
          className={css`
            font-weight: 400;
            margin-left: 0.5rem;
            margin-right: 1rem;
          `}
        >
          {name}
        </span>
        <EntityTagsRow isTimeEntry={false} entityRecord={entityRecord} />
      </Flex>
      <div>
        <strong>{entryCount}</strong> time {entryLabel}
      </div>
    </ListItemBase>
  );
};

export default BasicListItem;
