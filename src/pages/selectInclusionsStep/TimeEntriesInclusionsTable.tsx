import format from "date-fns/format";
import React from "react";
import { PayloadActionCreator } from "typesafe-actions";

import {
  InclusionsTable,
  InclusionsTableCheckboxCell,
  InclusionsTableFoot,
  InclusionsTableRow,
} from "~/components";
import { TimeEntryTableViewModel } from "~/typeDefs";

const NullValueCell: React.FC<{
  disabled: boolean;
  value: string | null;
}> = ({ disabled, value, ...props }) => (
  <td
    css={({ colors }) => ({
      color: (value === null || disabled
        ? colors.manatee
        : colors.midnight
      ).concat(" !important"),
      fontStyle: value === null ? "italic" : "normal",
    })}
    {...props}
  />
);

interface Props {
  isDuplicateCheckEnabled: boolean;
  timeEntries: TimeEntryTableViewModel[];
  totalCountsByType: Record<string, number>;
  onFlipIsIncluded: PayloadActionCreator<string, string>;
}

const TimeEntriesInclusionsTable: React.FC<Props> = (props) => (
  <InclusionsTable aria-labelledby="time-entries-desc">
    <thead>
      <tr>
        <th scope="col">Start Time</th>
        <th scope="col">End Time</th>
        <th scope="col">Task</th>
        <th scope="col">Project</th>
        <th scope="col" rowSpan={2} data-include={true}>
          Include?
        </th>
      </tr>
      <tr>
        <th scope="col" colSpan={3}>
          Description
        </th>
        <th scope="col">Tags</th>
      </tr>
    </thead>
    <tbody>
      {props.timeEntries.map((timeEntry) => (
        <React.Fragment key={timeEntry.id}>
          <InclusionsTableRow disabled={timeEntry.existsInTarget}>
            <td>{format(timeEntry.start, "Pp")}</td>
            <td>{format(timeEntry.end, "Pp")}</td>
            <NullValueCell
              disabled={timeEntry.existsInTarget}
              value={timeEntry.taskName}
            >
              {timeEntry.taskName ?? "None"}
            </NullValueCell>
            <NullValueCell
              disabled={timeEntry.existsInTarget}
              value={timeEntry.projectName}
            >
              {timeEntry.projectName ?? "None"}
            </NullValueCell>
            <InclusionsTableCheckboxCell
              rowSpan={2}
              entityRecord={timeEntry}
              onFlipIsIncluded={props.onFlipIsIncluded}
            />
          </InclusionsTableRow>
          <InclusionsTableRow disabled={timeEntry.existsInTarget}>
            <td colSpan={3}>{timeEntry.description}</td>
            <td>{timeEntry.tagNames.join(", ")}</td>
          </InclusionsTableRow>
        </React.Fragment>
      ))}
    </tbody>
    <InclusionsTableFoot
      fieldCount={4}
      totalCountsByType={props.totalCountsByType}
    />
  </InclusionsTable>
);

export default TimeEntriesInclusionsTable;
