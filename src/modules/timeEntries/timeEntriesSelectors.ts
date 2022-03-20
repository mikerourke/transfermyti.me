import * as R from "ramda";
import { createSelector, Selector } from "reselect";

import { activeWorkspaceIdSelector } from "~/modules/workspaces/workspacesSelectors";
import {
  ReduxState,
  TimeEntryModel,
  TimeEntryTableViewModel,
} from "~/typeDefs";

export const isDuplicateCheckEnabledSelector = createSelector(
  (state: ReduxState) => state.timeEntries.isDuplicateCheckEnabled,
  (isDuplicateCheckEnabled): boolean => isDuplicateCheckEnabled,
);

export const sourceTimeEntriesSelector = createSelector(
  (state: ReduxState) => state.timeEntries.source,
  (timeEntriesById): TimeEntryModel[] => Object.values(timeEntriesById),
);

export const includedSourceTimeEntriesSelector = createSelector(
  sourceTimeEntriesSelector,
  (sourceTimeEntries): TimeEntryModel[] =>
    sourceTimeEntries.filter((sourceTimeEntry) => sourceTimeEntry.isIncluded),
);

export const sourceTimeEntriesForTransferSelector = createSelector(
  includedSourceTimeEntriesSelector,
  isDuplicateCheckEnabledSelector,
  (sourceTimeEntries, isDuplicateCheckEnabled) =>
    isDuplicateCheckEnabled
      ? sourceTimeEntries.filter((sourceTimeEntry) =>
          R.isNil(sourceTimeEntry.linkedId),
        )
      : sourceTimeEntries,
);

export const sourceTimeEntriesInActiveWorkspaceSelector = createSelector(
  sourceTimeEntriesSelector,
  activeWorkspaceIdSelector,
  (sourceTimeEntries, activeWorkspaceId) =>
    sourceTimeEntries.filter(
      (sourceTimeEntry) => sourceTimeEntry.workspaceId === activeWorkspaceId,
    ),
);

export const timeEntriesForInclusionsTableSelector = createSelector(
  (state: ReduxState) => state.allEntities.areExistsInTargetShown,
  sourceTimeEntriesInActiveWorkspaceSelector,
  (state: ReduxState) => state.projects.source,
  (state: ReduxState) => state.tasks.source,
  isDuplicateCheckEnabledSelector,
  (
    areExistsInTargetShown,
    sourceTimeEntries,
    sourceProjectsById,
    sourceTasksById,
    isDuplicateCheckEnabled,
  ): TimeEntryTableViewModel[] =>
    sourceTimeEntries.reduce((acc, sourceTimeEntry) => {
      const existsInTarget = sourceTimeEntry.linkedId !== null;
      if (existsInTarget && !areExistsInTargetShown) {
        return acc;
      }

      const projectName = R.pathOr(
        null,
        [sourceTimeEntry.projectId ?? "", "name"],
        sourceProjectsById,
      );

      let taskName = null;
      if (sourceTimeEntry.taskId !== null) {
        taskName = R.pathOr(
          null,
          [sourceTimeEntry.taskId, "name"],
          sourceTasksById,
        );
      }

      return [
        ...acc,
        {
          ...sourceTimeEntry,
          projectName,
          taskName,
          existsInTarget: isDuplicateCheckEnabled ? existsInTarget : false,
          isActiveInSource: true,
          isActiveInTarget: existsInTarget,
        },
      ];
    }, [] as TimeEntryTableViewModel[]),
);

export const timeEntriesTotalCountsByTypeSelector = createSelector(
  timeEntriesForInclusionsTableSelector,
  (timeEntriesForInclusionsTable) =>
    timeEntriesForInclusionsTable.reduce(
      (acc, { existsInTarget, isIncluded }: TimeEntryTableViewModel) => ({
        existsInTarget: acc.existsInTarget + (existsInTarget ? 1 : 0),
        isIncluded: acc.isIncluded + (isIncluded ? 1 : 0),
      }),
      {
        existsInTarget: 0,
        isIncluded: 0,
      },
    ),
);

export const sourceTimeEntryCountByTagIdSelector = createSelector(
  sourceTimeEntriesSelector,
  (sourceTimeEntries) => {
    const timeEntryCountByTagIdField: Record<string, number> = {};

    for (const timeEntry of sourceTimeEntries) {
      for (const tagId of timeEntry.tagIds) {
        const currentValue = R.propOr<number, Record<string, number>, number>(
          0,
          tagId,
          timeEntryCountByTagIdField,
        );
        timeEntryCountByTagIdField[tagId] = currentValue + 1;
      }
    }

    return timeEntryCountByTagIdField;
  },
);

export const sourceTimeEntryCountByIdFieldSelectorFactory = (
  idField: string,
): Selector<ReduxState, Record<string, number>> =>
  createSelector(sourceTimeEntriesSelector, (sourceTimeEntries) => {
    const timeEntryCountByIdField: Record<string, number> = {};

    for (const timeEntry of sourceTimeEntries) {
      const parentId = timeEntry[idField];
      if (parentId) {
        const currentCountForId = R.propOr<
          number,
          Record<string, number>,
          number
        >(0, parentId, timeEntryCountByIdField);
        timeEntryCountByIdField[parentId] = currentCountForId + 1;
      }
    }

    return timeEntryCountByIdField;
  });
