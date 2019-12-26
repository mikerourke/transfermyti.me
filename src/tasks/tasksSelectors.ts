import { createSelector } from "reselect";
import * as R from "ramda";
import { selectActiveWorkspaceId } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { TaskModel } from "~/tasks/tasksTypes";

export const selectSourceTasks = createSelector(
  (state: ReduxState) => state.tasks.source,
  (tasksById): TaskModel[] => Object.values(tasksById),
);

export const selectSourceTasksForTransfer = createSelector(
  selectSourceTasks,
  sourceTasks =>
    sourceTasks.filter(sourceTask =>
      R.and(sourceTask.isIncluded, R.isNil(sourceTask.linkedId)),
    ),
);

export const selectSourceTasksInActiveWorkspace = createSelector(
  selectSourceTasks,
  selectActiveWorkspaceId,
  (sourceTasks, workspaceId): TaskModel[] =>
    sourceTasks.filter(task => task.workspaceId === workspaceId),
);
