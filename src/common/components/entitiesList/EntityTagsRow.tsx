import React from "react";
import { When } from "react-if";
import { get, isNil } from "lodash";
import EntityTag, { EntityTagType } from "../EntityTag";
import Flex, { FlexProps } from "../Flex";
import { CompoundEntityModel } from "~/common/commonTypes";

interface Props extends FlexProps {
  isTimeEntry: boolean;
  entityRecord: CompoundEntityModel;
}

const EntityTagsRow: React.FC<Props> = ({
  isTimeEntry,
  entityRecord,
  ...flexProps
}) => {
  const tagSize = isTimeEntry ? "small" : "large";

  return (
    <Flex {...flexProps} data-testid="entity-tags-row">
      <When condition={!get(entityRecord, "isActive", true)}>
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
