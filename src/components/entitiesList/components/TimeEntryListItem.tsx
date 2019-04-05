import React from 'react';
import { ListRowProps } from 'react-virtualized';
import { css } from 'emotion';
import TimeEntryTable from '~/components/timeEntryTable/TimeEntryTable';
import ListItemBase from './ListItemBase';
import { DetailedTimeEntryModel } from '~/types/timeEntriesTypes';
import EntityTagsRow from '~/components/entitiesList/components/EntityTagsRow';

interface Props extends ListRowProps {
  timeEntry: DetailedTimeEntryModel;
  isOmitted: boolean;
}

const TimeEntryListItem: React.FC<Props> = ({
  timeEntry,
  isOmitted,
  isScrolling,
  isVisible,
  ...listItemProps
}) => {
  return (
    <ListItemBase
      className={css`
        position: relative;
      `}
      height={104}
      isOmitted={isOmitted}
      {...listItemProps}
    >
      <TimeEntryTable timeEntry={timeEntry} />
      <EntityTagsRow
        className={css`
          position: absolute;
          right: 0;
          top: -0.5rem;
        `}
        isTimeEntry
        entityRecord={timeEntry}
      />
    </ListItemBase>
  );
};

export default TimeEntryListItem;
