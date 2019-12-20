import React from "react";
import { ListRowProps } from "react-virtualized";
import TimeEntryTable from "../timeEntryTable/TimeEntryTable";
import EntityTagsRow from "./EntityTagsRow";
import ListItemBase from "./ListItemBase";
import { DetailedTimeEntryModel } from "~/timeEntries/timeEntriesTypes";

interface Props extends ListRowProps {
  timeEntry: DetailedTimeEntryModel;
  isOmitted: boolean;
}

const TimeEntryListItem: React.FC<Props> = ({
  timeEntry,
  isOmitted,
  isScrolling,
  isVisible,
  ...props
}) => (
  <ListItemBase
    data-testid="time-entry-list-item"
    css={{ position: "relative" }}
    height={104}
    isOmitted={isOmitted}
    {...props}
  >
    <TimeEntryTable timeEntry={timeEntry} />
    <EntityTagsRow
      css={{ position: "absolute", right: 0, top: "-0.5rem" }}
      isTimeEntry
      entityRecord={timeEntry}
    />
  </ListItemBase>
);

export default TimeEntryListItem;
