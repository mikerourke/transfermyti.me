import React from 'react';
import { When } from 'react-if';
import { Tag } from 'bloomer';
import { css } from 'emotion';
import { isNil } from 'lodash';
import Flex, { FlexProps } from '~/components/flex/Flex';
import { EntityModel } from '~/types/commonTypes';

interface Props extends FlexProps {
  isTimeEntry: boolean;
  entityRecord: EntityModel;
}

const EntityTagsRow: React.FC<Props> = ({
  isTimeEntry,
  entityRecord,
  ...flexProps
}) => {
  const { isIncluded, isActive = true, linkedId } = entityRecord as any;

  const tagClass = css`
    font-weight: bold;
    margin-right: 0.5rem;
  `;

  const entryStyle = isTimeEntry
    ? { height: '1.5rem', fontSize: '0.625rem' }
    : {};

  return (
    <Flex {...flexProps}>
      <When condition={!isActive}>
        <Tag isColor="warning" className={tagClass} style={entryStyle}>
          Archived
        </Tag>
      </When>
      <When condition={!isIncluded}>
        <Tag isColor="danger" className={tagClass} style={entryStyle}>
          Excluded{!isTimeEntry && ' by User'}
        </Tag>
      </When>
      <When condition={!isNil(linkedId)}>
        <Tag isColor="info" className={tagClass} style={entryStyle}>
          {!isTimeEntry && 'Already on '}Clockify
        </Tag>
      </When>
    </Flex>
  );
};

export default EntityTagsRow;
