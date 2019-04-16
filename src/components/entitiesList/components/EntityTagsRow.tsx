import React from 'react';
import { When } from 'react-if';
import { get, isNil } from 'lodash';
import EntityTag, { EntityTagType } from '~/components/entityTag/EntityTag';
import Flex, { FlexProps } from '~/components/flex/Flex';
import { CompoundEntityModel } from '~/types';

interface Props extends FlexProps {
  isTimeEntry: boolean;
  entityRecord: CompoundEntityModel;
}

const EntityTagsRow: React.FC<Props> = ({
  isTimeEntry,
  entityRecord,
  ...flexProps
}) => {
  const tagSize = isTimeEntry ? 'small' : 'large';

  return (
    <Flex {...flexProps}>
      <When condition={!get(entityRecord, 'isActive', true)}>
        <EntityTag size={tagSize} tagType={EntityTagType.Archived} />
      </When>
      <When condition={!entityRecord.isIncluded}>
        <EntityTag size={tagSize} tagType={EntityTagType.Excluded} />
      </When>
      <When condition={!isNil(entityRecord.linkedId)}>
        <EntityTag size={tagSize} tagType={EntityTagType.Existing} />
      </When>
    </Flex>
  );
};

export default EntityTagsRow;
