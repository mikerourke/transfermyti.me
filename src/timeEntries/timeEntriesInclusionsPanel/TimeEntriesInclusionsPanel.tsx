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
  timeEntriesTotalCountForInclusionsTableSelector,
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
import { ReduxState } from "~/redux/reduxTypes";
import { TimeEntryTableViewModel } from "~/timeEntries/timeEntriesTypes";

interface ConnectStateProps {
  includedTotalCount: number;
  replaceMappingWithToolName: (label: string) => string;
  timeEntries: TimeEntryTableViewModel[];
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
  onUpdateAreAllIncluded: PayloadActionCreator<string, boolean>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const TimeEntriesInclusionsPanelComponent: React.FC<Props> = props => {
  const areAllToggled = props.includedTotalCount === props.timeEntries.length;

  const handleFlipInclusions = (): void => {
    props.onUpdateAreAllIncluded(!areAllToggled);
  };

  return (
    <AccordionPanel rowNumber={5} title="Time Entries">
      <InclusionsTableTitle
        id="timeEntriesDesc"
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
          {props.timeEntries.map(timeEntry => (
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
          totalCountsByType={{ entryCount: props.includedTotalCount }}
        />
      </InclusionsTable>
    </AccordionPanel>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  includedTotalCount: timeEntriesTotalCountForInclusionsTableSelector(state),
  replaceMappingWithToolName: replaceMappingWithToolNameSelector(state),
  timeEntries: timeEntriesForInclusionsTableSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsTimeEntryIncluded,
  onUpdateAreAllIncluded: updateAreAllTimeEntriesIncluded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TimeEntriesInclusionsPanelComponent);
