import React from "react";
import { connect } from "react-redux";
import type {
  PayloadActionCreator,
  EmptyActionCreator,
} from "typesafe-actions";

import {
  AccordionPanel,
  InclusionsTableTitle,
  NoRecordsFound,
} from "~/components";
import {
  replaceMappingWithToolNameSelector,
  toolActionSelector,
} from "~/modules/allEntities/allEntitiesSelectors";
import {
  flipIsTimeEntryIncluded,
  updateAreAllTimeEntriesIncluded,
  flipIsDuplicateCheckEnabled,
} from "~/modules/timeEntries/timeEntriesActions";
import {
  timeEntriesForInclusionsTableSelector,
  timeEntriesTotalCountsByTypeSelector,
  isDuplicateCheckEnabledSelector,
} from "~/modules/timeEntries/timeEntriesSelectors";
import {
  ToolAction,
  type ReduxState,
  type TimeEntryTableViewModel,
} from "~/typeDefs";

import DuplicateCheckToggle from "./DuplicateCheckToggle";
import TimeEntriesInclusionsTable from "./TimeEntriesInclusionsTable";
import TimeEntryComparisonDisclaimer from "./TimeEntryComparisonDisclaimer";

interface ConnectStateProps {
  isDuplicateCheckEnabled: boolean;
  replaceMappingWithToolName: (label: string) => string;
  timeEntries: TimeEntryTableViewModel[];
  toolAction: ToolAction;
  totalCountsByType: Record<string, number>;
}

interface ConnectDispatchProps {
  onFlipIsDuplicateCheckEnabled: EmptyActionCreator<string>;
  onFlipIsIncluded: PayloadActionCreator<string, string>;
  onUpdateAreAllIncluded: PayloadActionCreator<string, boolean>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const TimeEntriesInclusionsPanelComponent: React.FC<Props> = ({
  timeEntries,
  ...props
}) => {
  const { isIncluded, existsInTarget } = props.totalCountsByType;
  const recordCount = timeEntries.length !== 0 ? timeEntries.length : 1;
  const areAllToggled = isIncluded + existsInTarget === recordCount;

  const handleFlipInclusions = (): void => {
    props.onUpdateAreAllIncluded(!areAllToggled);
  };

  const nonExistingRecords = timeEntries.filter(
    ({ existsInTarget }) => !existsInTarget,
  );

  return (
    <AccordionPanel rowNumber={5} title="Time Entries">
      {timeEntries.length === 0 ? (
        <NoRecordsFound />
      ) : (
        <>
          {props.toolAction === ToolAction.Transfer && (
            <>
              <TimeEntryComparisonDisclaimer />

              <DuplicateCheckToggle
                onToggle={props.onFlipIsDuplicateCheckEnabled}
                isToggled={props.isDuplicateCheckEnabled}
              />
            </>
          )}
          <InclusionsTableTitle
            id="time-entries-desc"
            flipDisabled={nonExistingRecords.length === 0}
            onFlipAreAllIncluded={handleFlipInclusions}
          >
            {props.replaceMappingWithToolName("Time Entry Records in Source")}
          </InclusionsTableTitle>
          <TimeEntriesInclusionsTable
            isDuplicateCheckEnabled={props.isDuplicateCheckEnabled}
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
  isDuplicateCheckEnabled: isDuplicateCheckEnabledSelector(state),
  replaceMappingWithToolName: replaceMappingWithToolNameSelector(state),
  timeEntries: timeEntriesForInclusionsTableSelector(state),
  toolAction: toolActionSelector(state),
  totalCountsByType: timeEntriesTotalCountsByTypeSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsDuplicateCheckEnabled: flipIsDuplicateCheckEnabled,
  onFlipIsIncluded: flipIsTimeEntryIncluded,
  onUpdateAreAllIncluded: updateAreAllTimeEntriesIncluded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TimeEntriesInclusionsPanelComponent);
