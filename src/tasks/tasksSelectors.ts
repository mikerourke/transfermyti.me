import { createSelector } from "reselect";
import { ReduxState } from "~/redux/reduxTypes";
import { TaskModel } from "~/tasks/tasksTypes";

export const selectTargetTasks = createSelector(
  (state: ReduxState) => state.tasks.target,
  (tasksById): TaskModel[] => Object.values(tasksById),
);

const selectTargetTasksInWorkspace = createSelector(
  selectTargetTasks,
  (_: unknown, workspaceId: string) => workspaceId,
  (targetTasks, workspaceId): TaskModel[] =>
    targetTasks.filter(task => task.workspaceId === workspaceId),
);

export const selectTargetTasksForTransfer = createSelector(
  selectTargetTasksInWorkspace,
  targetTasks => targetTasks.filter(task => task.isIncluded),
);
