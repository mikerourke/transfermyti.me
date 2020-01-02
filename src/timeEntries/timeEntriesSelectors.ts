import { createSelector, Selector } from "reselect";
import * as R from "ramda";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { TimeEntryModel, TimeEntryTableViewModel } from "./timeEntriesTypes";

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

export const timeEntriesForTableViewSelector = createSelector(
  sourceTimeEntriesInActiveWorkspaceSelector,
  (state: ReduxState) => state.projects.source,
  (state: ReduxState) => state.tasks.source,
  (
    sourceTimeEntries,
    sourceProjectsById,
    sourceTasksById,
  ): TimeEntryTableViewModel[] =>
    sourceTimeEntries.map(sourceTimeEntry => {
      const existsInTarget = sourceTimeEntry.linkedId !== null;
      const projectName = R.pathOr(
        "Unknown Project",
        [sourceTimeEntry.projectId, "name"],
        sourceProjectsById,
      );

      let taskName = "No Task";
      if (sourceTimeEntry.taskId !== null) {
        taskName = R.pathOr(
          "No Task",
          [sourceTimeEntry.taskId, "name"],
          sourceTasksById,
        );
      }

      return {
        ...sourceTimeEntry,
        projectName,
        taskName,
        existsInTarget,
        isActiveInSource: true,
        isActiveInTarget: existsInTarget,
      };
    }),
);

export const sourceTimeEntryCountByIdFieldSelectorFactory = (
  idField: string,
): Selector<ReduxState, Record<string, number>> =>
  createSelector(sourceTimeEntriesSelector, sourceTimeEntries => {
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

export const sourceTimeEntryCountByTagIdSelector = createSelector(
  sourceTimeEntriesSelector,
  sourceTimeEntries => {
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
