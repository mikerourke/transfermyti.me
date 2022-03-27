import * as R from "ramda";
import { createSelector } from "reselect";

import { selectIdToLinkedId } from "~/entityOperations/selectIdToLinkedId";
import { sourceProjectsByIdSelector } from "~/modules/projects/projectsSelectors";
import { sourceTimeEntryCountByIdFieldSelectorFactory } from "~/modules/timeEntries/timeEntriesSelectors";
import { activeWorkspaceIdSelector } from "~/modules/workspaces/workspacesSelectors";
import type {
  ReduxState,
  Task,
  TasksByIdModel,
  TaskTableRecord,
} from "~/typeDefs";

export const sourceTasksByIdSelector = createSelector(
  (state: ReduxState) => state.tasks.source,
  (sourceTasksById): TasksByIdModel => sourceTasksById,
);

const targetTasksByIdSelector = createSelector(
  (state: ReduxState) => state.tasks.target,
  (targetTasksById): TasksByIdModel => targetTasksById,
);

export const sourceTasksSelector = createSelector(
  sourceTasksByIdSelector,
  (sourceTasksById): Task[] => Object.values(sourceTasksById),
);

export const includedSourceTasksSelector = createSelector(
  sourceTasksSelector,
  (sourceTasks): Task[] =>
    sourceTasks.filter((sourceTask) => sourceTask.isIncluded),
);

export const includedSourceTasksCountSelector = createSelector(
  includedSourceTasksSelector,
  (includedSourceTasks) => includedSourceTasks.length,
);

export const sourceTasksForTransferSelector = createSelector(
  includedSourceTasksSelector,
  (sourceTasks) =>
    sourceTasks.filter((sourceTask) => R.isNil(sourceTask.linkedId)),
);

export const sourceTasksInActiveWorkspaceSelector = createSelector(
  activeWorkspaceIdSelector,
  sourceTasksSelector,
  (workspaceId, sourceTasks): Task[] =>
    sourceTasks.filter((task) => task.workspaceId === workspaceId),
);

export const taskIdToLinkedIdSelector = createSelector(
  sourceTasksByIdSelector,
  (sourceTasksById): Record<string, string> =>
    selectIdToLinkedId(sourceTasksById),
);

export const tasksForInclusionsTableSelector = createSelector(
  (state: ReduxState) => state.allEntities.areExistsInTargetShown,
  sourceTasksInActiveWorkspaceSelector,
  targetTasksByIdSelector,
  sourceProjectsByIdSelector,
  sourceTimeEntryCountByIdFieldSelectorFactory("taskId"),
  (
    areExistsInTargetShown,
    sourceTasks,
    targetTasksById,
    sourceProjectsById,
    timeEntryCountByTaskId,
  ): TaskTableRecord[] =>
    sourceTasks.reduce((acc, sourceTask) => {
      const existsInTarget = sourceTask.linkedId !== null;
      if (existsInTarget && !areExistsInTargetShown) {
        return acc;
      }

      let isActiveInTarget = false;
      if (existsInTarget) {
        const targetId = sourceTask.linkedId as string;
        isActiveInTarget = targetTasksById[targetId].isActive;
      }

      const entryCount = R.propOr<number, Record<string, number>, number>(
        0,
        sourceTask.id,
        timeEntryCountByTaskId,
      );

      return [
        ...acc,
        {
          ...sourceTask,
          entryCount,
          existsInTarget,
          isActiveInSource: sourceTask.isActive,
          isActiveInTarget,
          projectName: sourceProjectsById[sourceTask.projectId].name,
        },
      ];
    }, [] as TaskTableRecord[]),
);

export const tasksTotalCountsByTypeSelector = createSelector(
  tasksForInclusionsTableSelector,
  (tasksForInclusionsTable) =>
    tasksForInclusionsTable.reduce(
      (
        acc,
        {
          entryCount,
          existsInTarget,
          isIncluded,
          isActiveInSource,
          isActiveInTarget,
        }: TaskTableRecord,
      ) => ({
        entryCount: acc.entryCount + entryCount,
        existsInTarget: acc.existsInTarget + (existsInTarget ? 1 : 0),
        isActiveInSource: acc.isActiveInSource + (isActiveInSource ? 1 : 0),
        isActiveInTarget: acc.isActiveInTarget + (isActiveInTarget ? 1 : 0),
        isIncluded: acc.isIncluded + (isIncluded ? 1 : 0),
      }),
      {
        entryCount: 0,
        existsInTarget: 0,
        isActiveInSource: 0,
        isActiveInTarget: 0,
        isIncluded: 0,
      },
    ),
);
