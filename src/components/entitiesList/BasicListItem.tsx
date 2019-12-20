import React from "react";
import { ListRowProps } from "react-virtualized";
import { When } from "react-if";
import { css } from "emotion";
import { isNil } from "lodash";
import Checkbox from "~/components/Checkbox";
import Flex from "~/components/Flex";
import ListItemBase from "./ListItemBase";
import EntityTagsRow from "./EntityTagsRow";
import { CompoundEntityModel } from "~/types";

interface Props extends ListRowProps {
  entityRecord: CompoundEntityModel;
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

  const entryLabel = entryCount === 1 ? "entry" : "entries";
  const hasClickEvent = !isNil(onItemClick);

  return (
    <ListItemBase
      data-testid="basic-list-item"
      height={48}
      isOmitted={isOmitted}
      className={css({ justifyContent: "space-between" })}
      {...listRowProps}
    >
      <Flex alignItems="center" data-testid="list-item-inner">
        <When condition={hasClickEvent}>
          <Checkbox
            checked={isIncluded}
            size="1.25rem"
            onClick={hasClickEvent ? onItemClick : undefined}
          />
        </When>
        <span
          className={css({
            fontWeight: 400,
            marginLeft: "0.5rem",
            marginRight: "1rem",
          })}
        >
          {name}
        </span>
        <EntityTagsRow isTimeEntry={false} entityRecord={entityRecord} />
      </Flex>
      <div data-testid="list-item-count-label">
        <strong>{entryCount}</strong> time {entryLabel}
      </div>
    </ListItemBase>
  );
};

export default BasicListItem;
