import { createSelector } from "reselect";
import * as R from "ramda";
import { selectActiveWorkspaceId } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { TimeEntryModel } from "~/timeEntries/timeEntriesTypes";

export const selectSourceTimeEntries = createSelector(
  (state: ReduxState) => state.timeEntries.source,
  (timeEntriesById): TimeEntryModel[] => Object.values(timeEntriesById),
);

export const selectSourceTimeEntriesForTransfer = createSelector(
  selectSourceTimeEntries,
  sourceTimeEntries =>
    sourceTimeEntries.filter(sourceTimeEntry =>
      R.and(sourceTimeEntry.isIncluded, R.isNil(sourceTimeEntry.linkedId)),
    ),
);

export const selectSourceTimeEntriesInActiveWorkspace = createSelector(
  selectSourceTimeEntries,
  selectActiveWorkspaceId,
  (sourceTimeEntries, activeWorkspaceId) =>
    sourceTimeEntries.filter(
      sourceTimeEntry => sourceTimeEntry.workspaceId === activeWorkspaceId,
    ),
);
