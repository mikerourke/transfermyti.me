import { isNil, propOr } from "ramda";

import { selectIdToLinkedId } from "~/api/selectIdToLinkedId";
import { sourceProjectsByIdSelector } from "~/redux/projects/projectsSelectors";
import { createSelector } from "~/redux/reduxTools";
import { sourceTimeEntryCountByIdFieldSelectorFactory } from "~/redux/timeEntries/timeEntriesSelectors";
import { activeWorkspaceIdSelector } from "~/redux/workspaces/workspacesSelectors";
import type { ReduxState, Task, TaskTableRecord } from "~/typeDefs";

export const sourceTasksByIdSelector = createSelector(
  (state: ReduxState) => state.tasks.source,
  (sourceTasksById): Dictionary<Task> => sourceTasksById,
);

const targetTasksByIdSelector = createSelector(
  (state: ReduxState) => state.tasks.target,
  (targetTasksById): Dictionary<Task> => targetTasksById,
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
    sourceTasks.filter((sourceTask) => isNil(sourceTask.linkedId)),
);

export const sourceTasksInActiveWorkspaceSelector = createSelector(
  activeWorkspaceIdSelector,
  sourceTasksSelector,
  (workspaceId, sourceTasks): Task[] =>
    sourceTasks.filter((task) => task.workspaceId === workspaceId),
);

export const taskIdToLinkedIdSelector = createSelector(
  sourceTasksByIdSelector,
  (sourceTasksById): Dictionary<string> => selectIdToLinkedId(sourceTasksById),
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
  ): TaskTableRecord[] => {
    const taskTableRecords: TaskTableRecord[] = [];

    for (const sourceTask of sourceTasks) {
      const existsInTarget = sourceTask.linkedId !== null;
      if (existsInTarget && !areExistsInTargetShown) {
        continue;
      }

      let isActiveInTarget = false;
      if (existsInTarget) {
        const targetId = sourceTask.linkedId as string;

        isActiveInTarget = targetTasksById[targetId].isActive;
      }

      const entryCount = propOr<number, Dictionary<number>, number>(
        0,
        sourceTask.id,
        timeEntryCountByTaskId,
      );

      taskTableRecords.push({
        ...sourceTask,
        entryCount,
        existsInTarget,
        isActiveInSource: sourceTask.isActive,
        isActiveInTarget,
        projectName: sourceProjectsById[sourceTask.projectId].name,
      });
    }

    return taskTableRecords;
  },
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
