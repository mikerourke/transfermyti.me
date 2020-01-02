import format from "date-fns/format";
import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { flipIsTimeEntryIncluded } from "~/timeEntries/timeEntriesActions";
import { timeEntriesForTableViewSelector } from "~/timeEntries/timeEntriesSelectors";
import {
  AccordionPanel,
  EntityListPanelTable,
  EntityListPanelTitle,
} from "~/components";
import { EntityGroup } from "~/allEntities/allEntitiesTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { TimeEntryTableViewModel } from "~/timeEntries/timeEntriesTypes";

interface ConnectStateProps {
  timeEntries: TimeEntryTableViewModel[];
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const TimeEntriesTableComponent: React.FC<Props> = props => {
  const [showExisting, setShowExisting] = React.useState<boolean>(true);

  const visibleTimeEntries = showExisting
    ? props.timeEntries
    : props.timeEntries.filter(timeEntry => !timeEntry.existsInTarget);

  return (
    <AccordionPanel
      rowNumber={5}
      title={
        <EntityListPanelTitle
          groupName="Time Entries"
          entityCount={visibleTimeEntries.length}
        />
      }
    >
      <EntityListPanelTable>
        <thead>
          <tr>
            <th className="include-cell" rowSpan={2}>
              Include?
            </th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Task</th>
            <th>Project</th>
          </tr>
          <tr>
            <th colSpan={3}>Description</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {visibleTimeEntries.map(({ existsInTarget, ...timeEntry }) => (
            <React.Fragment key={timeEntry.id}>
              <EntityListPanelTable.BodyRow existsInTarget={existsInTarget}>
                <td className="include-cell" rowSpan={2}>
                  <input
                    type="checkbox"
                    checked={existsInTarget ? false : timeEntry.isIncluded}
                    disabled={existsInTarget}
                    onChange={() => props.onFlipIsIncluded(timeEntry.id)}
                  />
                </td>
                <td>{format(timeEntry.start, "Pp")}</td>
                <td>{format(timeEntry.end, "Pp")}</td>
                <td>{timeEntry.taskName}</td>
                <td>{timeEntry.projectName}</td>
              </EntityListPanelTable.BodyRow>
              <EntityListPanelTable.BodyRow existsInTarget={existsInTarget}>
                <td colSpan={3}>{timeEntry.description}</td>
                <td>{timeEntry.tagNames.join(", ")}</td>
              </EntityListPanelTable.BodyRow>
            </React.Fragment>
          ))}
        </tbody>
        <EntityListPanelTable.Footer
          columnCount={5}
          entityGroup={EntityGroup.TimeEntries}
          isShowExisting={showExisting}
          onToggle={() => setShowExisting(!showExisting)}
        />
      </EntityListPanelTable>
    </AccordionPanel>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  timeEntries: timeEntriesForTableViewSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsTimeEntryIncluded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TimeEntriesTableComponent);
