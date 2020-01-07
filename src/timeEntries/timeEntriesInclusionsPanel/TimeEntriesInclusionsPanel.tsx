import format from "date-fns/format";
import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { replaceMappingWithToolNameSelector } from "~/app/appSelectors";
import {
  updateAreAllTimeEntriesIncluded,
  flipIsTimeEntryIncluded,
} from "~/timeEntries/timeEntriesActions";
import {
  timeEntriesTotalCountsByTypeSelector,
  timeEntriesForInclusionsTableSelector,
} from "~/timeEntries/timeEntriesSelectors";
import {
  AccordionPanel,
  InclusionsTable,
  InclusionsTableCheckboxCell,
  InclusionsTableFoot,
  InclusionsTableRow,
  InclusionsTableTitle,
} from "~/components";
import TimeEntryComparisonDisclaimer from "./TimeEntryComparisonDisclaimer";
import { ReduxState } from "~/redux/reduxTypes";
import { TimeEntryTableViewModel } from "~/timeEntries/timeEntriesTypes";

interface ConnectStateProps {
  replaceMappingWithToolName: (label: string) => string;
  timeEntries: TimeEntryTableViewModel[];
  totalCountsByType: Record<string, number>;
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
  onUpdateAreAllIncluded: PayloadActionCreator<string, boolean>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const TimeEntriesInclusionsPanelComponent: React.FC<Props> = ({
  timeEntries,
  ...props
}) => {
  const { isIncluded, existsInTarget } = props.totalCountsByType;
  const areAllToggled = isIncluded + existsInTarget === timeEntries.length;

  const handleFlipInclusions = (): void => {
    props.onUpdateAreAllIncluded(!areAllToggled);
  };

  const nonExistingRecords = timeEntries.filter(
    ({ existsInTarget }) => !existsInTarget,
  );

  return (
    <AccordionPanel rowNumber={5} title="Time Entries">
      <TimeEntryComparisonDisclaimer />
      <InclusionsTableTitle
        id="timeEntriesDesc"
        flipDisabled={nonExistingRecords.length === 0}
        onFlipAreAllIncluded={handleFlipInclusions}
      >
        {props.replaceMappingWithToolName("Time Entry Records in Source")}
      </InclusionsTableTitle>
      <InclusionsTable aria-labelledby="timeEntriesDesc">
        <thead>
          <tr>
            <th scope="col">Start Time</th>
            <th scope="col">End Time</th>
            <th scope="col">Task</th>
            <th scope="col">Project</th>
            <th scope="col" rowSpan={2} data-include={true}>
              Include in Transfer?
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
          {timeEntries.map(timeEntry => (
            <React.Fragment key={timeEntry.id}>
              <InclusionsTableRow disabled={timeEntry.existsInTarget}>
                <td>{format(timeEntry.start, "Pp")}</td>
                <td>{format(timeEntry.end, "Pp")}</td>
                <td>{timeEntry.taskName}</td>
                <td>{timeEntry.projectName}</td>
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
    </AccordionPanel>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  replaceMappingWithToolName: replaceMappingWithToolNameSelector(state),
  timeEntries: timeEntriesForInclusionsTableSelector(state),
  totalCountsByType: timeEntriesTotalCountsByTypeSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsTimeEntryIncluded,
  onUpdateAreAllIncluded: updateAreAllTimeEntriesIncluded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TimeEntriesInclusionsPanelComponent);
