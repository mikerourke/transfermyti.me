import React from 'react';
import { css } from 'emotion';
import { first, get } from 'lodash';
import format from 'date-fns/format';
import HeadersRow from './components/HeadersRow';
import ValuesRow from './components/ValuesRow';
import { DetailedTimeEntryModel } from '~/types';

interface Props {
  timeEntry: DetailedTimeEntryModel;
}

const DATE_FORMAT = 'M/D/YY hh:mma';

const TimeEntryTable: React.FC<Props> = ({ timeEntry }) => {
  const getTagsList = () => {
    if (timeEntry.tags.length === 0) {
      return '';
    }

    if (timeEntry.tags.length === 1) {
      return first(timeEntry.tags).name;
    }

    return timeEntry.tags.reduce((acc, { name }) => `${acc}${name}, `, '');
  };

  return (
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
          <td>{get(timeEntry, ['project', 'name'], '')}</td>
          <td>{get(timeEntry, ['client', 'name'], '')}</td>
          <td
            colSpan={2}
            className={css`
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;
            `}
          >
            {timeEntry.description}
          </td>
        </ValuesRow>
        <HeadersRow hasTopBorder>
          <td>Start Time</td>
          <td>End Time</td>
          <td>User</td>
          <td>Tag(s)</td>
        </HeadersRow>
        <ValuesRow isBottomPadded={false}>
          <td>{format(timeEntry.start, DATE_FORMAT)}</td>
          <td>{format(timeEntry.end, DATE_FORMAT)}</td>
          <td>{get(timeEntry, ['user', 'name'], '')}</td>
          <td>{getTagsList()}</td>
        </ValuesRow>
      </tbody>
    </table>
  );
};

export default TimeEntryTable;
