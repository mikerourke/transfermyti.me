import { isNil, pathOr, propOr } from "ramda";

import { createSelector, type Selector } from "~/redux/reduxTools";
import { activeWorkspaceIdSelector } from "~/redux/workspaces/workspaces.selectors";
import type { ReduxState, TimeEntry, TimeEntryTableRecord } from "~/types";

export const isDuplicateCheckEnabledSelector = createSelector(
  (state: ReduxState) => state.timeEntries.isDuplicateCheckEnabled,
  (isDuplicateCheckEnabled): boolean => isDuplicateCheckEnabled,
);

export const sourceTimeEntriesSelector = createSelector(
  (state: ReduxState) => state.timeEntries.source,
  (timeEntriesById): TimeEntry[] => Object.values(timeEntriesById),
);

export const includedSourceTimeEntriesSelector = createSelector(
  sourceTimeEntriesSelector,
  (sourceTimeEntries): TimeEntry[] =>
    sourceTimeEntries.filter((sourceTimeEntry) => sourceTimeEntry.isIncluded),
);

export const sourceTimeEntriesForTransferSelector = createSelector(
  includedSourceTimeEntriesSelector,
  isDuplicateCheckEnabledSelector,
  (sourceTimeEntries, isDuplicateCheckEnabled) =>
    // prettier-ignore
    isDuplicateCheckEnabled
      ? sourceTimeEntries.filter((sourceTimeEntry) => isNil(sourceTimeEntry.linkedId))
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
  ): TimeEntryTableRecord[] => {
    const timeEntryTableRecords: TimeEntryTableRecord[] = [];

    for (const sourceTimeEntry of sourceTimeEntries) {
      const existsInTarget = sourceTimeEntry.linkedId !== null;

      if (existsInTarget && !areExistsInTargetShown) {
        continue;
      }

      const projectName = pathOr(
        null,
        [sourceTimeEntry.projectId ?? "", "name"],
        sourceProjectsById,
      );

      let taskName = null;
      if (sourceTimeEntry.taskId !== null) {
        taskName = pathOr(
          null,
          [sourceTimeEntry.taskId, "name"],
          sourceTasksById,
        );
      }

      timeEntryTableRecords.push({
        ...sourceTimeEntry,
        projectName,
        taskName,
        existsInTarget: isDuplicateCheckEnabled ? existsInTarget : false,
        isActiveInSource: true,
        isActiveInTarget: existsInTarget,
      });
    }

    return timeEntryTableRecords;
  },
);

export const timeEntriesTotalCountsByTypeSelector = createSelector(
  timeEntriesForInclusionsTableSelector,
  (timeEntriesForInclusionsTable) =>
    timeEntriesForInclusionsTable.reduce(
      (acc, { existsInTarget, isIncluded }: TimeEntryTableRecord) => ({
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
    const timeEntryCountByTagIdField: Dictionary<number> = {};

    for (const timeEntry of sourceTimeEntries) {
      for (const tagId of timeEntry.tagIds) {
        const currentValue = propOr<number, Dictionary<number>, number>(
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
): Selector<ReduxState, Dictionary<number>> =>
  createSelector(sourceTimeEntriesSelector, (sourceTimeEntries) => {
    const timeEntryCountByIdField: Dictionary<number> = {};

    for (const timeEntry of sourceTimeEntries) {
      // @ts-expect-error
      const parentId = timeEntry[idField];

      if (!isNil(parentId)) {
        const currentCountForId = propOr<number, Dictionary<number>, number>(
          0,
          parentId,
          timeEntryCountByIdField,
        );

        timeEntryCountByIdField[parentId] = currentCountForId + 1;
      }
    }

    return timeEntryCountByIdField;
  });
