import React from "react";
import { List, ListRowProps } from "react-virtualized";
import { css } from "emotion";
import { isNil } from "lodash";
import BasicListItem from "./BasicListItem";
import TimeEntryListItem from "./TimeEntryListItem";
import { CompoundEntityModel, EntityGroup } from "~/common/commonTypes";
import { DetailedTimeEntryModel } from "~/timeEntries/timeEntriesTypes";

interface Props {
  entityGroup: EntityGroup;
  entityRecords: Array<CompoundEntityModel>;
  height: number;
  width: number;
  onItemClick?: (
    entityGroup: EntityGroup,
    entityRecord: CompoundEntityModel,
  ) => void;
}

const EntitiesList: React.FC<Props> = props => {
  const listRowHeight =
    props.entityGroup === EntityGroup.TimeEntries ? 120 : 64;

  const listRowRenderer = (listRowProps: ListRowProps): JSX.Element => {
    const entityRecord = props.entityRecords[listRowProps.index];
    const isOmitted = !entityRecord.isIncluded || !isNil(entityRecord.linkedId);

    if (props.entityGroup === EntityGroup.TimeEntries) {
      return (
        <TimeEntryListItem
          timeEntry={entityRecord as DetailedTimeEntryModel}
          isOmitted={isOmitted}
          {...listRowProps}
        />
      );
    }

    const handleItemClick = (): void =>
      props.onItemClick(props.entityGroup, entityRecord);

    return (
      <BasicListItem
        entityRecord={entityRecord}
        isOmitted={isOmitted}
        onItemClick={!isNil(props.onItemClick) ? handleItemClick : undefined}
        {...listRowProps}
      />
    );
  };

  return (
    <List
      data-testid="entities-list"
      width={props.width}
      height={props.height}
      className={css({
        "&:focus": {
          outline: 0,
        },
      })}
      rowHeight={listRowHeight}
      rowClassName={css({ cursor: "pointer" })}
      rowCount={props.entityRecords.length}
      rowRenderer={listRowRenderer}
    />
  );
};

export default EntitiesList;
