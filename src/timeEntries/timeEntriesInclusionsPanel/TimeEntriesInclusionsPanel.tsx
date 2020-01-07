import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { replaceMappingWithToolNameSelector } from "~/app/appSelectors";
import NoRecordsFound from "~/components/NoRecordsFound";
import {
  flipIsTimeEntryIncluded,
  updateAreAllTimeEntriesIncluded,
} from "~/timeEntries/timeEntriesActions";
import {
  timeEntriesForInclusionsTableSelector,
  timeEntriesTotalCountsByTypeSelector,
} from "~/timeEntries/timeEntriesSelectors";
import { AccordionPanel, InclusionsTableTitle } from "~/components";
import TimeEntriesInclusionsTable from "./TimeEntriesInclusionsTable";
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
  const recordCount = timeEntries.length;
  const areAllToggled = isIncluded + existsInTarget === recordCount;

  const handleFlipInclusions = (): void => {
    props.onUpdateAreAllIncluded(!areAllToggled);
  };

  const nonExistingRecords = timeEntries.filter(
    ({ existsInTarget }) => !existsInTarget,
  );

  return (
    <AccordionPanel rowNumber={5} title="Time Entries">
      {recordCount === 0 ? (
        <NoRecordsFound />
      ) : (
        <>
          <TimeEntryComparisonDisclaimer />
          <InclusionsTableTitle
            id="timeEntriesDesc"
            flipDisabled={nonExistingRecords.length === 0}
            onFlipAreAllIncluded={handleFlipInclusions}
          >
            {props.replaceMappingWithToolName("Time Entry Records in Source")}
          </InclusionsTableTitle>
          <TimeEntriesInclusionsTable
            timeEntries={timeEntries}
            totalCountsByType={props.totalCountsByType}
            onFlipIsIncluded={props.onFlipIsIncluded}
          />
        </>
      )}
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
