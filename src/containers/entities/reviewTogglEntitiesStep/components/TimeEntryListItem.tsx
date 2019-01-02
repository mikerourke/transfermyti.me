import React from 'react';
import { ListRowProps } from 'react-virtualized';
import { css } from 'emotion';
import { Box } from 'bloomer';
import format from 'date-fns/format';
import { DetailedTimeEntryModel } from '../../../../types/timeEntriesTypes';

interface Props extends ListRowProps {
  entityRecord: DetailedTimeEntryModel;
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
      padding-left: 2px;
      text-align: left;
    }

    tr:nth-of-type(odd) td {
      color: var(--info);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }

    tr:nth-child(3) {
      border-top: 1px solid rgba(10, 10, 10, 0.1);

      td {
        padding-top: 4px;
      }
    }

    tr:nth-of-type(even) td {
      font-size: 14px;
      font-weight: 400;
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
              <td>Project</td>
              <td>Client</td>
              <td colSpan={2}>Description</td>
            </tr>
            <tr
              className={css`
                td {
                  padding-bottom: 4px;
                }
              `}
            >
              <td>{entityRecord.projectName}</td>
              <td>{entityRecord.client}</td>
              <td
                colSpan={2}
                className={css`
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  overflow: hidden;
                `}
              >
                {entityRecord.description}
              </td>
            </tr>
            <tr>
              <td>Start Time</td>
              <td>End Time</td>
              <td>User</td>
              <td>Tag(s)</td>
            </tr>
            <tr>
              <td>{formatDate(entityRecord.start)}</td>
              <td>{formatDate(entityRecord.end)}</td>
              <td>{entityRecord.userName}</td>
              <td>{entityRecord.tagList}</td>
            </tr>
          </tbody>
        </table>
      </Box>
    </div>
  );
};

export default TimeEntryListItem;
