import React from 'react';
import { ListRowProps } from 'react-virtualized';
import { Box } from 'bloomer';
import { css } from 'emotion';
import Flex from '../../flex/Flex';
import TimeEntryTable from '../../timeEntryTable/TimeEntryTable';
import { DetailedTimeEntryModel } from '../../../types/timeEntriesTypes';

interface Props extends ListRowProps {
  timeEntryRecord: DetailedTimeEntryModel;
}

const TimeEntryListItem: React.FunctionComponent<Props> = ({
  timeEntryRecord,
  isScrolling,
  isVisible,
  ...props
}) => {
  return (
    <Flex {...props} alignItems="center" justifyContent="flex-start">
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
        <TimeEntryTable timeEntryRecord={timeEntryRecord} />
      </Flex>
    </Flex>
  );
};

export default TimeEntryListItem;
