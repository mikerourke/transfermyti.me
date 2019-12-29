import { createSelector } from "reselect";
import * as R from "ramda";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { TaskModel, TasksByIdModel } from "~/tasks/tasksTypes";

export const sourceTasksByIdSelector = createSelector(
  (state: ReduxState) => state.tasks.source,
  (sourceTasksById): TasksByIdModel => sourceTasksById,
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
