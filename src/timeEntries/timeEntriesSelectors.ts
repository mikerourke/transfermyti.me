import { createSelector } from "reselect";
import * as R from "ramda";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { TimeEntryModel } from "~/timeEntries/timeEntriesTypes";

export const sourceTimeEntriesSelector = createSelector(
  (state: ReduxState) => state.timeEntries.source,
  (timeEntriesById): TimeEntryModel[] => Object.values(timeEntriesById),
);

export const includedSourceTimeEntriesSelector = createSelector(
  sourceTimeEntriesSelector,
  (sourceTimeEntries): TimeEntryModel[] =>
    sourceTimeEntries.filter(sourceTimeEntry => sourceTimeEntry.isIncluded),
);

export const sourceTimeEntriesForTransferSelector = createSelector(
  includedSourceTimeEntriesSelector,
  sourceTimeEntries =>
    sourceTimeEntries.filter(sourceTimeEntry =>
      R.isNil(sourceTimeEntry.linkedId),
    ),
);

export const sourceTimeEntriesInActiveWorkspaceSelector = createSelector(
  sourceTimeEntriesSelector,
  activeWorkspaceIdSelector,
  (sourceTimeEntries, activeWorkspaceId) =>
    sourceTimeEntries.filter(
      sourceTimeEntry => sourceTimeEntry.workspaceId === activeWorkspaceId,
    ),
);
