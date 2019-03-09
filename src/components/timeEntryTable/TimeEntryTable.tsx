import React from 'react';
import { css } from 'emotion';
import format from 'date-fns/format';
import HeadersRow from './components/HeadersRow';
import ValuesRow from './components/ValuesRow';
import { DetailedTimeEntryModel } from '~/types/timeEntriesTypes';

interface Props {
  timeEntryRecord: DetailedTimeEntryModel;
}

const DATE_FORMAT = 'M/D/YY hh:mma';

const TimeEntryTable: React.FunctionComponent<Props> = ({
  timeEntryRecord,
}) => (
  <table
    className={css`
      table-layout: fixed;
      width: 100%;

      td {
        padding-left: 2px;
        text-align: left;
      }
    `}
  >
    <tbody>
      <HeadersRow hasTopBorder={false}>
        <td>Project</td>
        <td>Client</td>
        <td colSpan={2}>Description</td>
      </HeadersRow>
      <ValuesRow isBottomPadded>
        <td>{timeEntryRecord.projectName}</td>
        <td>{timeEntryRecord.client}</td>
        <td
          colSpan={2}
          className={css`
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          `}
        >
          {timeEntryRecord.description}
        </td>
      </ValuesRow>
      <HeadersRow hasTopBorder>
        <td>Start Time</td>
        <td>End Time</td>
        <td>User</td>
        <td>Tag(s)</td>
      </HeadersRow>
      <ValuesRow isBottomPadded={false}>
        <td>{format(timeEntryRecord.start, DATE_FORMAT)}</td>
        <td>{format(timeEntryRecord.end, DATE_FORMAT)}</td>
        <td>{timeEntryRecord.userName}</td>
        <td>{timeEntryRecord.tagList}</td>
      </ValuesRow>
    </tbody>
  </table>
);

export default TimeEntryTable;
