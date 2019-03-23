import React from 'react';
import { List, ListRowProps } from 'react-virtualized';
import { css } from 'emotion';
import { isNil } from 'lodash';
import BasicListItem from './components/BasicListItem';
import TimeEntryListItem from './components/TimeEntryListItem';
import { EntityModel } from '~/types/commonTypes';
import { EntityGroup } from '~/types/entityTypes';
import { DetailedTimeEntryModel } from '~/types/timeEntriesTypes';

interface Props {
  entityGroup: EntityGroup;
  entityRecords: EntityModel[];
  height: number;
  width: number;
  onItemClick?: (entityGroup: EntityGroup, entityRecord: EntityModel) => void;
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
    if (entityGroup === EntityGroup.TimeEntries) {
      return (
        <TimeEntryListItem
          timeEntryRecord={entityRecord as DetailedTimeEntryModel}
          {...listRowProps}
        />
      );
    }

    const handleItemClick = () => onItemClick(entityGroup, entityRecord);

    return (
      <BasicListItem
        entityRecord={entityRecord}
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
