import React from 'react';
import { ListRowProps } from 'react-virtualized';
import { Box } from 'bloomer';
import { css } from 'emotion';
import Flex from '~/components/flex/Flex';
import TimeEntryTable from '~/components/timeEntryTable/TimeEntryTable';
import { DetailedTimeEntryModel } from '~/types/timeEntriesTypes';

interface Props extends ListRowProps {
  timeEntry: DetailedTimeEntryModel;
}

const TimeEntryListItem: React.FC<Props> = ({
  timeEntry,
  isScrolling,
  isVisible,
  ...flexProps
}) => {
  return (
    <Flex {...flexProps} alignItems="center" justifyContent="flex-start">
      <Flex
        as={Box}
        alignItems="center"
        className={css`
          height: 104px;
          margin-left: 4px;
          padding-left: 8px;
          width: calc(100% - 16px);
        `}
      >
        <TimeEntryTable timeEntry={timeEntry} />
      </Flex>
    </Flex>
  );
};

export default TimeEntryListItem;
