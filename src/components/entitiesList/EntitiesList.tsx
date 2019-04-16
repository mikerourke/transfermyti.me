import React from 'react';
import { List, ListRowProps } from 'react-virtualized';
import { css } from 'emotion';
import { isNil } from 'lodash';
import BasicListItem from './components/BasicListItem';
import TimeEntryListItem from './components/TimeEntryListItem';
import {
  CompoundEntityModel,
  DetailedTimeEntryModel,
  EntityGroup,
} from '~/types';

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

const EntitiesList: React.FC<Props> = ({
  entityGroup,
  entityRecords,
  height,
  width,
  onItemClick,
}) => {
  const listRowHeight = entityGroup === EntityGroup.TimeEntries ? 120 : 64;

  const listRowRenderer = (listRowProps: ListRowProps) => {
    const entityRecord = entityRecords[listRowProps.index];
    const isOmitted = !entityRecord.isIncluded || !isNil(entityRecord.linkedId);

    if (entityGroup === EntityGroup.TimeEntries) {
      return (
        <TimeEntryListItem
          timeEntry={entityRecord as DetailedTimeEntryModel}
          isOmitted={isOmitted}
          {...listRowProps}
        />
      );
    }

    const handleItemClick = () => onItemClick(entityGroup, entityRecord);

    return (
      <BasicListItem
        entityRecord={entityRecord}
        isOmitted={isOmitted}
        onItemClick={!isNil(onItemClick) ? handleItemClick : undefined}
        {...listRowProps}
      />
    );
  };

  return (
    <List
      width={width}
      height={height}
      className={css`
        max-height: ${height}px;
        &:focus {
          outline: 0;
        }
      `}
      rowHeight={listRowHeight}
      rowClassName={css`
        cursor: pointer;
      `}
      rowCount={entityRecords.length}
      rowRenderer={listRowRenderer}
    />
  );
};

export default EntitiesList;
