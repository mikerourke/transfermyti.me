import React from "react";
import { first, get } from "lodash";
import format from "date-fns/format";
import styled from "@emotion/styled";
import HeadersRow from "./HeadersRow";
import ValuesRow from "./ValuesRow";
import { DetailedTimeEntryModel } from "~/timeEntries/timeEntriesTypes";

const Table = styled.table({
  tableLayout: "fixed",
  width: "100%",

  td: {
    paddingLeft: 2,
    textAlign: "left",
  },
});

const DescriptionCell = styled.td({
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  overflow: "hidden",
});

interface Props {
  timeEntry: DetailedTimeEntryModel;
}

const DATE_FORMAT = "M/d/yy hh:mma";

const TimeEntryTable: React.FC<Props> = ({ timeEntry }) => {
  const getTagsList = (): string => {
    if (timeEntry.tags.length === 0) {
      return "";
    }

    if (timeEntry.tags.length === 1) {
      return first(timeEntry.tags).name;
    }

    return timeEntry.tags.reduce((acc, { name }) => `${acc}${name}, `, "");
  };

  return (
    <Table data-testid="time-entry-table">
      <tbody>
        <HeadersRow hasTopBorder={false}>
          <td>Project</td>
          <td>Client</td>
          <td colSpan={2}>Description</td>
        </HeadersRow>
        <ValuesRow isBottomPadded>
          <td>{get(timeEntry, ["project", "name"], "")}</td>
          <td>{get(timeEntry, ["client", "name"], "")}</td>
          <DescriptionCell colSpan={2}>{timeEntry.description}</DescriptionCell>
        </ValuesRow>
        <HeadersRow hasTopBorder>
          <td>Start Time</td>
          <td>End Time</td>
          <td>User</td>
          <td>Tag(s)</td>
        </HeadersRow>
        <ValuesRow isBottomPadded={false}>
          <td>{format(new Date(timeEntry.start), DATE_FORMAT)}</td>
          <td>{format(new Date(timeEntry.end), DATE_FORMAT)}</td>
          <td>{get(timeEntry, ["user", "name"], "")}</td>
          <td>{getTagsList()}</td>
        </ValuesRow>
      </tbody>
    </Table>
  );
};

export default TimeEntryTable;
