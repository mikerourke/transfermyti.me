import { createSelector } from "reselect";
import { ReduxState } from "~/redux/reduxTypes";
import { TimeEntryModel } from "~/timeEntries/timeEntriesTypes";

export const selectSourceTimeEntries = createSelector(
  (state: ReduxState) => state.timeEntries.source,
  (timeEntriesById): TimeEntryModel[] => Object.values(timeEntriesById),
);

const selectTargetTimeEntriesInWorkspace = createSelector(
  selectSourceTimeEntries,
  (_: ReduxState, workspaceId: string) => workspaceId,
  (sourceTimeEntries, workspaceId): TimeEntryModel[] =>
    sourceTimeEntries.filter(
      timeEntry => timeEntry.workspaceId === workspaceId,
    ),
);

export const selectTargetTimeEntriesForTransfer = createSelector(
  selectTargetTimeEntriesInWorkspace,
  sourceTimeEntries =>
    sourceTimeEntries.filter(timeEntry => timeEntry.isIncluded),
);
