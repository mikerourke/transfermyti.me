import { createSelector } from "reselect";
import { ReduxState } from "~/redux/reduxTypes";
import { TimeEntryModel } from "~/timeEntries/timeEntriesTypes";

export const selectTargetTimeEntries = createSelector(
  (state: ReduxState) => state.timeEntries.target,
  (timeEntriesById): TimeEntryModel[] => Object.values(timeEntriesById),
);

const selectTargetTimeEntriesInWorkspace = createSelector(
  selectTargetTimeEntries,
  (_: unknown, workspaceId: string) => workspaceId,
  (targetTimeEntries, workspaceId): TimeEntryModel[] =>
    targetTimeEntries.filter(
      timeEntry => timeEntry.workspaceId === workspaceId,
    ),
);

export const selectTargetTimeEntriesForTransfer = createSelector(
  selectTargetTimeEntriesInWorkspace,
  targetTimeEntries =>
    targetTimeEntries.filter(timeEntry => timeEntry.isIncluded),
);
