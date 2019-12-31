import { createSelector } from "reselect";
import * as R from "ramda";
import { sourceProjectsByIdSelector } from "~/projects/projectsSelectors";
import { sourceTimeEntryCountByIdFieldSelectorFactory } from "~/timeEntries/timeEntriesSelectors";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import { TableViewModel } from "~/allEntities/allEntitiesTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { TaskModel, TasksByIdModel } from "./tasksTypes";

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
  (sourceTasksById): TaskModel[] => Object.values(sourceTasksById),
);

export const includedSourceTasksSelector = createSelector(
  sourceTasksSelector,
  (sourceTasks): TaskModel[] =>
    sourceTasks.filter(sourceTask => sourceTask.isIncluded),
);

export const sourceTasksForTransferSelector = createSelector(
  includedSourceTasksSelector,
  sourceTasks => sourceTasks.filter(sourceTask => R.isNil(sourceTask.linkedId)),
);

export const sourceTasksInActiveWorkspaceSelector = createSelector(
  sourceTasksSelector,
  activeWorkspaceIdSelector,
  (sourceTasks, workspaceId): TaskModel[] =>
    sourceTasks.filter(task => task.workspaceId === workspaceId),
);

export const tasksForTableViewSelector = createSelector(
  sourceTasksInActiveWorkspaceSelector,
  targetTasksByIdSelector,
  sourceProjectsByIdSelector,
  sourceTimeEntryCountByIdFieldSelectorFactory("taskId"),
  (
    sourceTasks,
    targetTasksById,
    sourceProjectsById,
    timeEntryCountByTaskId,
  ): TableViewModel<TaskModel & { projectName: string }>[] =>
    sourceTasks.map(sourceTask => {
      const existsInTarget = sourceTask.linkedId !== null;
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

      return {
        ...sourceTask,
        entryCount,
        existsInTarget,
        isActiveInSource: sourceTask.isActive,
        isActiveInTarget,
        projectName: sourceProjectsById[sourceTask.projectId].name,
      };
    }),
);
