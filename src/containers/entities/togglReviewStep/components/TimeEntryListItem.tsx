import React from 'react';
import { ListRowProps } from 'react-virtualized';
import { css } from 'emotion';
import { Box } from 'bloomer';
import format from 'date-fns/format';
import { TimeEntryModel } from '../../../../types/timeEntriesTypes';

// TODO: Finish this (fix rendering issues and make fixed).

interface Props extends ListRowProps {
  entityRecord: TimeEntryModel;
}

const TimeEntryListItem: React.FunctionComponent<Props> = ({
  entityRecord,
  isScrolling,
  isVisible,
  ...props
}) => {
  const formatDate = (dateValue: Date) => format(dateValue, 'M/D/YY hh:mma');

  const tableStyles = css`
    table-layout: fixed;
    width: 100%;

    td {
      text-align: left;
    }

    tr:nth-of-type(odd) td {
      font-size: 12px;
      font-weight: bold;
    }
  `;

  return (
    <div
      {...props}
      className={css`
        align-items: center;
        display: flex;
        justify-content: flex-start;
      `}
    >
      <Box
        className={css`
          align-items: center;
          display: flex;
          height: 104px;
          margin-left: 4px;
          padding-left: 8px;
          width: calc(100% - 16px);
        `}
      >
        <table className={tableStyles}>
          <tbody>
            <tr>
              <td
                rowSpan={4}
                className={css`
                  vertical-align: middle;
                `}
              >
                <input type="checkbox" />
              </td>
              <td>Project</td>
              <td>Client</td>
              <td>Start Time</td>
              <td>End Time</td>
            </tr>
            <tr
              className={css`
                td {
                  padding-bottom: 4px;
                }
              `}
            >
              <td>Test Project Name</td>
              <td>{entityRecord.client}</td>
              <td>{formatDate(entityRecord.start)}</td>
              <td>{formatDate(entityRecord.end)}</td>
            </tr>
            <tr>
              <td colSpan={2}>Description</td>
              <td>User</td>
              <td>Tags</td>
            </tr>
            <tr>
              <td colSpan={2}>{entityRecord.description}</td>
              <td>Some User</td>
              <td>
                {entityRecord.tags.reduce((acc, tag) => `${acc}, ${tag}`, '')}
              </td>
            </tr>
          </tbody>
        </table>
      </Box>
    </div>
  );
};

export default TimeEntryListItem;
